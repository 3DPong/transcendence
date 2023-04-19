import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import {
  ChannelBanList,
  ChannelMuteList,
  ChannelType,
  ChannelUser,
  ChannelUserRoles,
  ChatChannel,
  DmChannel,
  MessageLog,
} from '../../entities';
import { User } from 'src/models/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ChannelDto, JoinDto, UserIdDto } from '../../dto/channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from './chatUser.service';
import { ChatSocketGateway } from '../../socket';
import { UserRelation } from 'src/models/user/entities';
import { RelationStatus } from 'src/common/enums/relationStatus.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatChannel)
    private channelRepository: Repository<ChatChannel>,
    @InjectRepository(ChannelUser)
    private channelUserRepository: Repository<ChannelUser>,
    @InjectRepository(MessageLog)
    private messageLogRepository: Repository<MessageLog>,
    @InjectRepository(DmChannel)
    private dmRepository: Repository<DmChannel>,
    @InjectRepository(ChannelBanList)
    private banRepository: Repository<ChannelBanList>,
    @InjectRepository(ChannelMuteList)
    private muteRepository: Repository<ChannelMuteList>,
    @Inject(forwardRef(() => ChatUserService))
    private readonly userService: ChatUserService,
    @InjectRepository(UserRelation)
    private relationRepository: Repository<UserRelation>,
    private dataSource: DataSource,
    private chatGateway: ChatSocketGateway
  ) {}

  /*
    id: number;
    name: string;
    profileURL: string;
    role: RoleType;         
    status: UserStatus; //현재 없음

  */
  async getChatUsers(channel_id: number): Promise<ChannelUser[]> {
    return await this.channelUserRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.user', 'us')
      .select(['us.user_id', 'us.nickname', 'us.profile_url', 'channel.role', 'channel.deleted_at'])
      .where('channel.channel_id = :channel_id', { channel_id })
      .withDeleted()
      .getMany();
  }

  async getMyChannels(user_id: number): Promise<ChatChannel[]> {
    const channelUsers: ChannelUser[] = await this.channelUserRepository.find({
      where: { user_id: user_id },
      select: {
        channel_id: true,
      },
    });
    const channelIds = channelUsers.map((user) => user.channel_id);

    const dmChannels: DmChannel[] = await this.dmRepository.find({
      where: [{ first_user_id: user_id }, { second_user_id: user_id }],
      order: { updated_at: 'DESC' }
    });

    const users: UserRelation[] = await this.getBlockedUsers(user_id);
    
    let count = 0;
    for (const dm of dmChannels) {
      if (users.some(user => user.target_id !== dm.first_user_id && user.target_id !== dm.second_user_id)) {
        channelIds.push(dm.channel_id);
        count++;
      }
      if (count >= 5) {
        break;
      }
    }

    return await this.channelRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.owner', 'owner')
      .select([
        'channel.channel_id',
        'channel.name',
        'channel.type',
        'owner.user_id',
        'owner.nickname',
        'owner.profile_url',
      ])
      .whereInIds(channelIds)
      .getMany();
  }

  async getChannel(id: number): Promise<ChatChannel> {
    return await this.channelRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.owner', 'owner')
      .select([
        'channel.channel_id',
        'channel.name',
        'channel.type',
        'owner.user_id',
        'owner.nickname',
        'owner.profile_url',
      ])
      .where('channel.channel_id = :id', { id })
      .getOne();
  }

  async getAllChannels(): Promise<ChatChannel[]> {
    return await this.channelRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.owner', 'owner')
      .select([
        'channel.channel_id',
        'channel.name',
        'channel.type',
        'owner.user_id',
        'owner.nickname',
        'owner.profile_url',
      ])
      .where('channel.type!= :type and channel.type!= :type2', { type: 'private', type2: 'dm' })
      .orderBy('channel.created_at', 'DESC')
      .getMany();
  }

  async getChatJoinUser(channel_id: number, user_id: number) {
  
    return await this.channelUserRepository
    .createQueryBuilder('channel')
    .innerJoin('channel.user', 'us')
    .select(['us.user_id', 'us.nickname', 'us.profile_url', 'channel.role', 'channel.deleted_at'])
    .where('channel.channel_id = :channel_id', { channel_id })
    .andWhere('channel.user_id = :user_id', { user_id })
    .getOne();
  }

  async getChatJoinUsers(channel_id: number, users: number[]): Promise<ChannelUser[]> {
    const promises = users.map(user_id => this.getChatJoinUser(channel_id, user_id));
    return await Promise.all(promises);
  }



  /*
    id : number;               // MessageId
    sender : number;       // Sender UserId 
    content: string;          // 메시지 내용
    createdAt: ???;           // 메시지 생성 시각. 타입을 어떻게 넣을지 협의 필요.
    type : ChatType; 

  */
  async getMessageLogs(take = 10, skip = 0, channel_id: number, user_id: number): Promise<MessageLog[]> {
    const channel = await this.channelRepository.findOne({ where: { channel_id } });
    if (!channel) throw new NotFoundException(`채널을 찾을 수 없습니다.`);

    if (await this.checkBanUser(channel_id, user_id)) throw new ForbiddenException('밴 상태 입니다!');

    return await this.messageLogRepository
      .createQueryBuilder('log')
      .innerJoin('log.channel', 'channel')
      .select(['log.message_id', 'log.user_id', 'log.content', 'log.created_at', 'channel.type'])
      .where('log.channel_id = :channel_id', { channel_id })
      .orderBy('log.created_at', 'DESC')
      .take(take)
      .skip(skip)
      .getMany();
  }

  async createChatRoom(channelDto: ChannelDto, user: User): Promise<ChatChannel> {
    const { name, password, type, inviteList, thumbnail_url } = channelDto;
    let hashedPassword = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (type == ChannelType.PROTECTED) {
      if (password == undefined) {
        throw new BadRequestException(`비밀번호 없음`);
      }
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
    }
    try {
      let channel = this.channelRepository.create({
        name,
        password: hashedPassword,
        type,
        owner: user,
        owner_id: user.user_id,
        thumbnail_url,
      });
      await queryRunner.manager.save(channel);

      const cu = this.channelUserRepository.create({
        channel_id: channel.channel_id,
        user_id: user.user_id,
        role: ChannelUserRoles.OWNER,
      });
      await queryRunner.manager.save(cu);
      if (inviteList !== null) {
        for (const userId of inviteList) {
          if (userId !== user.user_id) {
            const cu = this.channelUserRepository.create({
              channel_id: channel.channel_id,
              user_id: userId,
              role: ChannelUserRoles.USER,
            });
            await queryRunner.manager.save(cu);
          }
        }
      }
      await queryRunner.commitTransaction();

      // owner 와 invited users 모두 새로 생성된 채널에 socket join
      channel = this.channelResult(channel);
      inviteList.push(user.user_id);
      this.chatGateway.handleJoinUsers(inviteList, user.user_id, channel.channel_id, channel);

      return channel;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async updateChatRoom(channel_id: number, channelDto: ChannelDto, user: User): Promise<void> {
    let { name, password, type, thumbnail_url, inviteList } = channelDto;
    const channel = await this.channelRepository.findOne({ where: { channel_id } });
    if (!channel) throw new NotFoundException(`채널을 찾을 수 없습니다.`);

    if (!(await this.checkAdminUser(user.user_id, channel_id)))
      throw new ForbiddenException(`채팅방 수정 권한이 없습니다.`);

    let hashedPassword = channel.password;
    if (type === ChannelType.PROTECTED) {
      if (channel.type !== ChannelType.PROTECTED && password === null) {
        throw new BadRequestException(`비밀번호 없음`);
      } else if (password !== null) {
        const salt = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(password, salt);
      }
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (inviteList !== null) {

        const users = await this.channelUserRepository.find({
          withDeleted: true,
          where: {channel_id},
          select : {user_id: true, deleted_at: true}
        });

        let deleList = [];
        inviteList = inviteList.filter(userId => {
          if (users.some(u => u.user_id === userId && u.deleted_at === null))
            return false;
          if (users.some(u => u.user_id === userId && u.deleted_at !== null))
            deleList.push(userId);  
          return true;
        });

        await Promise.all(deleList.map(async userId => {
          await queryRunner.manager.delete(ChannelUser, { channel_id, user_id: userId });
        }));

        for (const userId of inviteList) {
          const cu = this.channelUserRepository.create({
            channel_id: channel.channel_id,
            user_id: userId,
            role: ChannelUserRoles.USER,
          });
          await queryRunner.manager.save(cu); 
        }
      }
      await queryRunner.manager.update(ChatChannel, {channel_id}, { name, type, password: hashedPassword, thumbnail_url });
      await queryRunner.commitTransaction();

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
      if (inviteList !== null) {
        this.chatGateway.handleJoinUsers(inviteList, user.user_id, channel_id, await this.getChannel(channel_id));
        this.chatGateway.handleEmitRoom(channel_id, await this.getChatJoinUsers(channel_id, inviteList));  
      }
    }
  }

  async createDmRoom(second_user: User, first_user: User): Promise<ChatChannel> {

    let dmChannel = await this.dmRepository.findOne({
      where: { first_user_id: first_user.user_id, second_user_id: second_user.user_id },
    });
    if (!dmChannel) {
      dmChannel = await this.dmRepository.findOne({
        where: { first_user_id: second_user.user_id, second_user_id: first_user.user_id },
      });
    }
    if (dmChannel) {
      await this.dmRepository.update(
        {
          first_user_id: first_user.user_id,
          second_user_id: second_user.user_id,
        },
        { updated_at: new Date() }
      );
      return await this.getChannel(dmChannel.channel_id);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const name: string = first_user.nickname + ' ' + second_user.nickname;
    try {
      const channel = this.channelRepository.create({
        name,
        type: ChannelType.DM,
        owner: first_user,
        owner_id: first_user.user_id,
      });
      await queryRunner.manager.save(channel);

      const dmChannel = this.dmRepository.create({
        first_user_id: first_user.user_id,
        second_user_id: second_user.user_id,
        channel_id: channel.channel_id,
      });
      await queryRunner.manager.save(dmChannel);

      await queryRunner.commitTransaction();

      const userIds: number[] = [first_user.user_id, second_user.user_id];
      this.chatGateway.handleJoinUsers(userIds, first_user.user_id, channel.channel_id, channel);

      return this.channelResult(channel);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  /*
    **joinChannelUser**
    1. 참여하려는 채널에서 ban 된 유저인지 확인하기
    2. 참여하려는 채널에서 이전에 참여했다가 나간 기록이 있는지 확인하기
       a. soft-delete 된 기록이 있으면 데이터를 hard-delete 한다.
    3. 일반 유저 권한으로 해탕 채널에 참여하기 위해 channelUser DB 에 삽입 
  
  */
  async joinChannelUser(joinDto: JoinDto, user_id: number): Promise<ChannelUser> {
    const { channel_id, password } = joinDto;
    const channel = await this.channelRepository.findOne({ where: { channel_id } });
    if (!channel) throw new NotFoundException(`채널을 찾을 수 없습니다.`);

    const banned = await this.banRepository.findOne({ where: { channel_id, user_id } });
    if (banned) {
      const time = new Date();
      if (banned.end_at > time) throw new ForbiddenException('밴 상태 입니다!');
    }

    switch (channel.type) {
      case ChannelType.PRIVATE:
        throw new ForbiddenException('권한이 없습니다!');
      case ChannelType.DM:
        throw new ForbiddenException('권한이 없습니다!');
      case ChannelType.PROTECTED:
        if (!(await bcrypt.compare(password, channel.password))) {
          throw new BadRequestException('비밀번호가 맞지 않습니다!');
        }
    }
    const existingUser = await this.channelUserRepository.findOne({
      withDeleted: true,
      where: { channel_id, user_id },
      select : { user_id: true, channel_id: true, deleted_at: true }
    });
    if (existingUser) {
      if (existingUser.deleted_at === null) {
        throw new ForbiddenException('이미 조인 된 채널입니다!');
      }
      await this.channelUserRepository.delete({ channel_id, user_id });
    }
    try {
      const cu = await this.createChannelUser(user_id, channel_id, ChannelUserRoles.USER);
      const users = [user_id];
      this.chatGateway.handleEmitRoom(channel_id, await this.getChatJoinUsers(channel_id, users));
      return cu;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /*
    **leaveChannel**
    1. 내가 owner 
      해당 room 에 포함된 user 목록(owner 제외) 가져옴
        a. user 목록이 없으면 chatChannel 삭제
        b. user 목록이 있고 admin이 있으면 오래된 순으로 owner 양도
	      c. user 목록이 있고 admin 이 없으면 일반 유저 중에서 오래된 순으로 owner  양도
      
    2. 내가 admin or user
      channelUser 데이터 삭제
  
  */
  async leaveChannel(user_id: number, channel_id: number) {

    const delUser = await this.channelUserRepository.findOne({
      where: { channel_id, user_id },
      relations: { channel: true},
    });
    if (!delUser) throw new NotFoundException(`해당 채널에 속한 유저가 아닙니다!`);
    if (delUser.channel.type === ChannelType.DM) throw new ForbiddenException('Dm은 나갈 수 없습니다!');
    try {
      if (delUser.role === ChannelUserRoles.OWNER) {
        const channelUsers: ChannelUser[] = await this.channelUserRepository.find({
          where: { channel_id },
          order: {created_at: 'ASC'},
          select: {
            user_id: true,
            role: true
          }
        });

        if (channelUsers.length === 1 && channelUsers[0].user_id === delUser.user_id) {
          await this.channelRepository.softDelete(channel_id);
        } else {
          let admin = channelUsers.find((users) => users.role === ChannelUserRoles.ADMIN);

          if (admin === undefined) {
            admin = channelUsers.find((users) => users.role === ChannelUserRoles.USER);
          }
          await this.channelUserRepository.update(
            {
              channel_id,
              user_id: admin.user_id,
            },
            { role: ChannelUserRoles.OWNER }
          );
          await this.channelRepository.update(channel_id, { owner_id: admin.user_id });
          this.chatGateway.handleAdminRoleUpdate(admin.user_id, channel_id, ChannelUserRoles.OWNER);
        }
      }
      await this.channelUserRepository.softDelete({ channel_id, user_id });

      this.chatGateway.handleLeaveUser(channel_id, delUser.user_id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async searchChannelsByChannelName(str: string): Promise<ChatChannel[]> {
    return await this.channelRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.owner', 'owner')
      .select([
        'channel.channel_id',
        'channel.name',
        'channel.type',
        'owner.user_id',
        'owner.nickname',
        'owner.profile_url',
      ])
      .where('channel.type!= :type and channel.type!= :type2', { type: 'private', type2: 'dm' })
      .andWhere('channel.name LIKE :name', { name: `%${str}%` })
      .orderBy('channel.created_at', 'DESC')
      .getMany();
  }

  async changeRole(channel_id: number, admin_id: number, userIdDto: UserIdDto) {
    if (!(await this.checkAdminUser(admin_id, channel_id))) {
      throw new ForbiddenException('권한이 없습니다!');
    }

    const role = await this.getUserRole(channel_id, userIdDto.user_id);

    if (!role) {
      throw new NotFoundException(`유저를 찾을 수 없습니다.`);
    } else if (role === 'owner') {
      throw new ForbiddenException('권한이 없습니다!');
    } else if (role === userIdDto.role) {
      throw new ForbiddenException(`이미 ${role} 입니다!`);
    }
    try {
      await this.channelUserRepository.update({ channel_id, user_id: userIdDto.user_id }, { role: userIdDto.role });
      this.chatGateway.handleAdminRoleUpdate(userIdDto.user_id, channel_id, userIdDto.role);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getMuteList(channel_id: number): Promise<ChannelMuteList[]> {
    
    const now = new Date();
    return await this.muteRepository
      .createQueryBuilder('mute')
      .innerJoin('mute.user', 'us')
      .select(['us.user_id', 'us.nickname', 'us.profile_url', 'mute.end_at'])
      .where('mute.channel_id = :channel_id', { channel_id })
      .andWhere('mute.end_at > :now', {now})
      .getMany();
  }

  async getBanList(channel_id: number, user_id: number): Promise<ChannelBanList[]> {
    if (!(await this.checkAdminUser(user_id, channel_id))) {
      throw new ForbiddenException('권한이 없습니다!');
    }
    const now = new Date();
    return await this.banRepository
      .createQueryBuilder('ban')
      .innerJoin('ban.user', 'us')
      .select(['us.user_id', 'us.nickname', 'us.profile_url', 'ban.end_at'])
      .where('ban.channel_id = :channel_id', { channel_id })
      .andWhere('ban.end_at > :now', {now})
      .getMany();
  }

  async deleteChatRoom(channel_id: number): Promise<void> {
    const result = await this.channelRepository.delete({ channel_id });
    if (result.affected === 0) throw new NotFoundException(`삭제 실패 : ${channel_id}`);
  }

  async createChannelUser(user_id: number, channel_id: number, role: ChannelUserRoles): Promise<ChannelUser>{
    const cu = this.channelUserRepository.create({
      channel_id: channel_id,
      user_id: user_id,
      role: role,
    });
    
    return await this.channelUserRepository.save(cu);
  }

  async getUserRole(channel_id: number, user_id: number) {
    const channelUser = await this.channelUserRepository.findOne({ where: { user_id, channel_id } });
    if (!channelUser) return null;
    switch (channelUser.role) {
      case ChannelUserRoles.USER:
        return ChannelUserRoles.USER;
      case ChannelUserRoles.ADMIN:
        return ChannelUserRoles.ADMIN;
      case ChannelUserRoles.OWNER:
        return ChannelUserRoles.OWNER;
    }
  }

  async getBlockedUsers( user_id: number): Promise<UserRelation[]> {
    return await this.relationRepository.find({
      where: {
        user_id,
        status: RelationStatus.BLOCK
      },
      select : {
        target_id: true
      }
    });
  }

  async checkAdminUser(user_id: number, channel_id: number): Promise<boolean> {
    const channelUser = await this.channelUserRepository.findOne({ where: { user_id, channel_id } });
    return !(!channelUser || channelUser.role == ChannelUserRoles.USER);
  }

  async checkBanUser(channel_id: number, user_id: number): Promise<boolean> {
    const banned = await this.banRepository.findOne({ where: { channel_id, user_id } });
    if (banned) {
      const time = new Date();
      if (banned.end_at > time) return true;
    }
    return false;
  }

  channelResult(result: ChatChannel) {
    delete result.password;
    delete result.deleted_at;
    delete result.owner_id;
    delete result.owner.email;
    delete result.owner.profile_url;
    delete result.owner.created_at;
    delete result.owner.deleted_at;
    delete result.owner.wins;
    delete result.owner.losses;
    delete result.owner.total;
    delete result.owner.level;
    delete result.owner.total;
    delete result.owner.two_factor;
    delete result.owner.two_factor_secret;

    return result;
  }

}
