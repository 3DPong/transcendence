import { ConflictException, forwardRef, HttpStatus, Inject } from '@nestjs/common';
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChannelUserRoles, DmChannel, MessageLog } from '../../entities';
import { ChannelType, ChatChannel } from '../../entities/chatChannel.entity';
import { User } from 'src/models/user/entities/user.entity';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ChannelDto, JoinDto, UserIdDto } from '../../dto/channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from './chatUser.service';
import { ChatSocketGateway } from '../../socket/chatSocket.gateway';

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
	async getChatUsers(channel_id : number):Promise <ChannelUser[]> {

		const channelUserss = await this.channelUserRepository
		.createQueryBuilder("channel")
      .innerJoin("channel.user", "us") //innerjoin 으로 수정
      .select([
        "us.user_id",
        "us.nickname",
        "us.profile_url",
        "channel.role",
				"channel.deleted_at"
      ])
      .where('channel.channel_id = :channel_id', {channel_id})
			.withDeleted()
			.getMany();

		return channelUserss;
	}

  async getMyChannels(user_id: number): Promise<ChatChannel[]> {

    const channelUsers : ChannelUser[]  = await this.channelUserRepository
      .createQueryBuilder("cu")
      .select("cu.channel_id")
      .where('cu.user_id = :user_id', {user_id})
      .getMany();
    const channelIds = channelUsers.map((user)=>user.channel_id)

    const dmChannels : DmChannel[] = await this.dmRepository
      .createQueryBuilder("dm")
      .select("dm.channel_id")
      .where('dm.first_user_id = :user_id', {user_id})
      .orWhere('dm.second_user_id = :user_id', {user_id})
      .orderBy("dm.updated_at", "DESC")
      .take(5)
      .getMany();
    dmChannels.map((dm) => channelIds.push(dm.channel_id));

    //console.log("\n\n\n\n\n")
    console.log(channelIds);
  
    const channel: ChatChannel[] = await this.channelRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.owner", "owner")
      .select([
        "channel.channel_id",
        "channel.name",
        "channel.type",
        "owner.user_id",
        "owner.nickname",
        "owner.profile_url"
      ])
      .whereInIds(channelIds)
      .getMany();

    return channel;
  }

  async getChannel(id: number): Promise <ChatChannel> {

    const channel: ChatChannel = await this.channelRepository
    .createQueryBuilder("channel")
    .innerJoin("channel.owner", "owner")
    .select([
      "channel.channel_id",
      "channel.name",
      "channel.type",
      "owner.user_id",
      "owner.nickname",
      "owner.profile_url"
    ])
    .where("channel.channel_id = :id", {id})
    .getOne();

    return channel;
  }

  async getAllChannels(): Promise <ChatChannel[]> {

    const channels: ChatChannel[] = await this.channelRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.owner", "owner")
      .select([
        "channel.channel_id",
        "channel.name",
        "channel.type",
        "owner.user_id",
        "owner.nickname",
        "owner.profile_url"
      ])
      .where('channel.type!= :type and channel.type!= :type2', {type: 'private', type2: 'dm'})
      .orderBy("channel.created_at", "DESC")
      .getMany();

    return channels;
  }

  /*
    id : number;               // MessageId
    sender : number;       // Sender UserId 
    content: string;          // 메시지 내용
    createdAt: ???;           // 메시지 생성 시각. 타입을 어떻게 넣을지 협의 필요.
    type : ChatType; 

  */
  async getMessageLogs(take: number = 10, skip : number = 0, channel_id : number, user_id: number) {
    
    const channel = await this.channelRepository.findOne({where :{channel_id}});
    if (!channel)
      throw new NotFoundException(`Can't find chat channel ${ channel_id}`);
    
    if (await this.checkBanUser(channel_id, user_id))
      throw new UnauthorizedException('Banned User!');

    const messages : MessageLog[] = await this.messageLogRepository
      .createQueryBuilder("log")
      .innerJoin("log.channel", "channel")
      .select([
        "log.message_id",
        "log.user_id",
        "log.content",
        "log.created_at",
        "channel.type"
      ])
      .where('log.channel_id = :channel_id', {channel_id})
      .orderBy("log.created_at", "DESC")
      .take(take)
      .skip(skip)
      .getMany()

    return messages;
  }

  async createChatRoom(channelDto: ChannelDto, user: User) : Promise<ChatChannel> {
    const { name, password, type, inviteList, thumbnail_url } = channelDto;
    let hashedPassword = null;
    
    const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();


    if (type == ChannelType.PROTECTED){
      if (password == undefined) {
        throw new NotFoundException(`비밀번호 없음`);
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
      thumbnail_url
    })
    await queryRunner.manager.save(channel);
    
    const cu = this.channelUserRepository.create({
      channel_id: channel.channel_id,
      user_id : user.user_id,
      role: ChannelUserRoles.OWNER
    });
    await queryRunner.manager.save(cu);
    if (inviteList !== null) {
      for (const userId of inviteList) {
        if (userId !== user.user_id) {
          const cu = this.channelUserRepository.create({
            channel_id: channel.channel_id,
            user_id : userId,
            role: ChannelUserRoles.USER
          });
          await queryRunner.manager.save(cu);       
        }
      }
    }
    await queryRunner.commitTransaction();

      // owner 와 invited users 모두 새로 생성된 채널에 socket join 
      const userIds =  inviteList;
      userIds.push(user.user_id);
      channel = this.channelResult(channel);
      this.chatGateway.handleJoinUsers(userIds, channel.channel_id, channel);

      return channel;
    } catch (error) {
      console.log(error)
      await queryRunner.rollbackTransaction();
			throw new InternalServerErrorException();
		} finally {
			await queryRunner.release();
		}
  }

  async updateChatRoom(channel_id: number, channelDto: ChannelDto, user: User) : Promise<void> {

    const { name, password, type, thumbnail_url } = channelDto;
    const channel = await this.channelRepository.findOne({where :{channel_id}});
    if (!channel)
      throw new NotFoundException(`can't find chat Channel ${ channel_id}`);

    if (channel.owner_id != user.user_id && !(await this.checkAdminUser(user.user_id, channel_id)))
      throw new NotFoundException(`Channel [ ${channel_id} ]'s User :${ user.user_id} has no Permission`);

    let hashedPassword = channel.password;
    if (channel.type != ChannelType.PROTECTED && type == ChannelType.PROTECTED){
      if (password == undefined) {
        throw new NotFoundException(`Can't find password`);
      }
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
    }
    try {
      await this.channelRepository.update(channel_id, {name, type, password: hashedPassword, thumbnail_url});
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createDmRoom(second_user: User, first_user : User) :Promise<ChatChannel>{
    
    let dmChannel = await this.dmRepository
      .findOne({where: {first_user_id: first_user.user_id, second_user_id: second_user.user_id}});
    if (!dmChannel) {
      dmChannel= await this.dmRepository
       .findOne({where: {first_user_id: second_user.user_id, second_user_id: first_user.user_id}});
    }
    if (dmChannel) {
      await this.dmRepository.update({first_user_id: first_user.user_id, second_user_id:second_user.user_id}, {updated_at: new Date()});
      return this.channelResult(dmChannel.channel);
    }
    const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

    const name : string = first_user.nickname + " " + second_user.nickname;
      try {
      const channel = this.channelRepository.create({
        name,
        type: ChannelType.DM,
        owner: first_user,
        owner_id: first_user.user_id
      });
      await queryRunner.manager.save(channel);
      
      const dmChannel = this.dmRepository.create({
        first_user_id: first_user.user_id,
        second_user_id: second_user.user_id,
        channel_id: channel.channel_id
      });
      await queryRunner.manager.save(dmChannel);

      await queryRunner.commitTransaction();
    
      let userIds :number[];
      userIds.push(first_user.user_id)
      userIds.push(second_user.user_id);
      this.chatGateway.handleJoinUsers(userIds, channel.channel_id, channel);

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
  async joinChannelUser(joinDto: JoinDto, user_id: number) : Promise <ChannelUser> {

    const { channel_id, password } = joinDto;
    const channel = await this.channelRepository.findOne({where :{channel_id}});
    if (!channel)
      throw new NotFoundException(`can't find chat Channel ${ channel_id}`);

    const banned = await this.banRepository.findOne({where: {channel_id, user_id}});
    if (banned) {
      const time = new Date();
      if (banned.end_at > time)
        throw new UnauthorizedException('banned User!');
    }

    switch (channel.type) {
      case ChannelType.PRIVATE:
        throw new UnauthorizedException('No permission!');
      case ChannelType.DM:
        throw new UnauthorizedException('No permission!');
      case ChannelType.PROTECTED:
        if (!(await bcrypt.compare(password, channel.password))) {
          throw new UnauthorizedException('Wrong password!');
        }
      default:
        const existingUser = await this.channelUserRepository.findOne({ withDeleted: true, where: {channel_id, user_id }});
        if (existingUser) {
          if (existingUser.deleted_at === null) {
            throw new UnauthorizedException('Already joined!');
          } 
          await this.channelUserRepository.delete({channel_id, user_id});
        } 
        return await this.createChannelUser(user_id, channel_id, ChannelUserRoles.USER);
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
  async leaveChannel(user_id: number, channel_id: number){
    try {
      const channel = await this.channelRepository.findOne({where :{channel_id}});
      if (!channel)
        throw new NotFoundException(`can't find chat Channel ${ channel_id}`);

      if (channel.owner_id === user_id) {
        const channelUsers : ChannelUser[]  = await this.channelUserRepository
          .createQueryBuilder('cu')
          .select([
            "cu.user_id",
            "cu.role"
          ])
          .where('cu.channel_id = :channel_id', {channel_id})
          .orderBy('cu.created_at', 'ASC')
          .getMany();

        if (channelUsers.length === 1 && channelUsers[0].user_id === channel.owner_id) {
          await this.channelRepository.softDelete(channel_id);
        }
        else {
          let admin = channelUsers.find((users) => (users.role === ChannelUserRoles.ADMIN));
    
          if (admin === undefined) {
            admin = channelUsers.find((users) => (users.role === ChannelUserRoles.USER));
          }
          await this.channelUserRepository.update({channel_id, user_id: admin.user_id}, {role: ChannelUserRoles.OWNER});
          await this.channelRepository.update(channel_id, {owner_id : admin.user_id});
        }
      } else {
        const delUser = await this.channelUserRepository.findOne({where: {channel_id, user_id}});
        if (!delUser)
          throw new NotFoundException(`can't find ${ channel_id}'s user ${user_id}`);
      }
      await this.channelUserRepository.softDelete({channel_id, user_id});
      
      const nickname = await this.userService.getUserNicname(user_id);
      this.chatGateway.handleLeaveUser(user_id, channel_id, nickname);
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException();
    }
  }

  async searchChannelsByChannelName(str: string) : Promise <ChatChannel[]> {

    const channels: ChatChannel[] = await this.channelRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.owner", "owner")
      .select([
        "channel.channel_id",
        "channel.name",
        "channel.type",
        "owner.user_id",
        "owner.nickname",
        "owner.profile_url"
      ])
      .where('channel.type!= :type and channel.type!= :type2', {type: 'private', type2: 'dm'})
      .andWhere('channel.name LIKE :name', {name: `%${str}%`})
      .orderBy("channel.created_at", "DESC")
      .getMany();

    return channels;
  }

  async changeRole(channel_id : number, admin_id : number, userIdDto: UserIdDto) {

    if(!this.checkAdminUser(admin_id, channel_id)) {
      throw new UnauthorizedException('No permission!');
    }

    const role =  await this.getUserRole(channel_id, userIdDto.user_id);
    
    if (!role) {
      throw new NotFoundException(`can't find ${channel_id}'s user`);
    } else if(role === "owner") {
      throw new UnauthorizedException('No permission!');
    } else if (role === userIdDto.role) {
      throw new UnauthorizedException(`Already ${role}!`);
    }
    try {
    await this.channelUserRepository
      .update({channel_id, user_id: userIdDto.user_id}, {role: userIdDto.role});
    this.chatGateway.hanndleAdminRoleUpdate(userIdDto.user_id, channel_id, userIdDto.role);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getMutelist(channel_id : number, user_id : number):Promise <ChannelMuteList[]> {

    if(!this.checkAdminUser(user_id, channel_id)) {
      throw new UnauthorizedException('No permission!');
    }

    const muteList = await this.muteRepository
      .createQueryBuilder("mute")
      .innerJoin("mute.user", "us") //innerjoin 으로 수정
      .select([
        "us.user_id",
        "us.nickname",
        "us.profile_url",
        "mute.end_at"
      ])
      .where('mute.channel_id = :channel_id', {channel_id})
      .getMany();

    return muteList;
  }

  async getBanlist(channel_id : number, user_id : number):Promise <ChannelBanList[]> {
    
    if(!this.checkAdminUser(user_id, channel_id)) {
      throw new UnauthorizedException('No permission!');
    }

    const banList = await this.banRepository
      .createQueryBuilder("ban")
      .leftJoin("ban.user", "us") //innerjoin 으로 수정
      .select([
        "us.user_id",
        "us.nickname",
        "us.profile_url",
        "ban.end_at"
      ])
      .where('ban.channel_id = :channel_id', {channel_id})
      .getMany();

    return banList;
  }

  async deleteChatRoom(channel_id: number) : Promise <void> {
    const result = await this.channelRepository.delete({channel_id});
    if (result.affected === 0)
      throw new NotFoundException(`Cant't find id ${channel_id}`)
  }


  async createChannelUser(user_id: number, channel_id: number, role: ChannelUserRoles) {
  
    const cu = this.channelUserRepository.create({
      channel_id: channel_id,
      user_id : user_id,
      role: role
    });
    await this.channelUserRepository.save(cu);
    return cu;
  }

  async getUserRole(channel_id: number,user_id: number) {
    const channelUser = await this.channelUserRepository.findOne({where: {user_id, channel_id}});
    if (!channelUser)
      return null;
    switch (channelUser.role) {
      case ChannelUserRoles.USER:
        return ChannelUserRoles.USER;
      case ChannelUserRoles.ADMIN:
        return ChannelUserRoles.ADMIN;
      case ChannelUserRoles.OWNER:
        return ChannelUserRoles.OWNER;
    }
  }

  async checkAdminUser(user_id: number, channel_id: number) : Promise <boolean> {
    const channelUser = await this.channelUserRepository.findOne({where: {user_id, channel_id}});
    if (!channelUser || channelUser.role == ChannelUserRoles.USER)
      return false;
    return true;
  }

  async checkBanUser(channel_id: number, user_id: number) : Promise <boolean> {
    const banned = await this.banRepository.findOne({where: {channel_id, user_id}});
    if (banned) {
      const time = new Date();
      if (banned.end_at > time)
        return true;
    }
    return false;
  }

  channelResult(channel: ChatChannel) {

    let result = channel;
  
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
    
    return result;
  }
}


