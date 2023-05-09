import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { Like, QueryFailedError, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserReqDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from '../dtos';
import { GetUserSettingResDto } from '../dtos/getUserSettingRes.dto';
import { JwtPayloadInterface } from '../../../../common/interfaces/JwtUser.interface';
import { VerifyNicknameResponseDto } from '../dtos/verifyNickname.dto';
import { SearchedUser, SearchUserResDto } from '../dtos/searchUserRes.dto';
import { Notifier } from '../../../notifier/services/notifier.class';
import { TopicEnum } from '../../../notifier/enums/topic.enum';
import { ChannelEnum } from '../../../notifier/enums/channel.enum';
import { UserUpdateDto } from '../../../../common/interfaces/userUpdate.dto';
import { GameHistoryDto, GetUserHistoryResDto } from '../dtos/getUserHistoryRes.dto';
import { Match } from '../../../game/entities';
import { RelationStatus } from '../../../../common/enums/relationStatus.enum';
import { CreateEmailUserReqDto } from '../dtos/createEmailUserReq.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Match) private matchRepository: Repository<Match>,
    private readonly notifier: Notifier
  ) {}

  async getUser(userId: number): Promise<GetUserResDto> {
    const user: GetUserResDto = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
      select: ['user_id', 'nickname', 'profile_url', 'wins', 'losses', 'total', 'level'],
    });
    if (!user) throw new BadRequestException('not exist user');
    return user;
  }

  async getMyUserSettings(userId: number): Promise<GetUserSettingResDto> {
    const user: GetUserSettingResDto = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
      select: ['user_id', 'nickname', 'profile_url', 'two_factor'],
    });
    if (!user) throw new UnauthorizedException('invalid user (session is not valid)');
    return user;
  }

  async createUser(data: JwtPayloadInterface, payload: CreateUserReqDto): Promise<void> {
    const newUser = new User();
    newUser.profile_url = payload.profile_url;
    newUser.nickname = payload.nickname;
    newUser.email = data.email;

    try {
      await this.userRepository.save(newUser);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('unique constraint') && error.message.includes('violates unique constraint')) {
          throw new ConflictException('duplicate column (nickname or email)');
        } else {
          throw new InternalServerErrorException('Database error');
        }
      } else {
        throw new InternalServerErrorException('session error');
      }
    }
  }

  async createEmailUser(data: JwtPayloadInterface, payload: CreateEmailUserReqDto): Promise<void> {    
    const newUser = new User();
    newUser.profile_url = payload.profile_url;
    newUser.nickname = payload.nickname;
    newUser.email = data.email;
    
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(payload.password, salt);
      newUser.password = hashedPassword;

      await this.userRepository.save(newUser);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('unique constraint') && error.message.includes('violates unique constraint')) {
          throw new ConflictException('duplicate column (nickname or email)');
        } else {
          throw new InternalServerErrorException('Database error');
        }
      } else {
        throw new InternalServerErrorException('session error');
      }
    }
  }

  // async verifyEmail(signupVerifyToken: string): Promise<string> {


  //   throw new InternalServerErrorException('email token error');

  // }

  async updateUser(userId: number, payload: UpdateUserReqDto): Promise<UpdateUserResDto> {
    // check user is valid
    const userToUpdate: User = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!userToUpdate) {
      throw new UnauthorizedException('invalid user (session is not valid)');
    }

    try {
      const res = await this.userRepository.update({ user_id: userId }, payload);
      if (res.affected === 0) throw new InternalServerErrorException('server error'); // check update is success
      // notify to all users
      const userUpdated: UserUpdateDto = {
        user_id: userId,
        nickname: payload.nickname ? payload.nickname : userToUpdate.nickname,
        profile_url: payload.profile_url ? payload.profile_url : userToUpdate.profile_url,
        status: userToUpdate.status,
      };
      await this.notifier.notify(userId, 'user_status', userUpdated, TopicEnum.USER, ChannelEnum.ALL, 0);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('unique constraint') && error.message.includes('violates unique constraint')) {
          throw new ConflictException('duplicate nickname');
        } else {
          throw new InternalServerErrorException('Database error');
        }
      } else {
        throw new InternalServerErrorException('server error');
      }
    }
    return new UpdateUserResDto(
      await this.userRepository.findOne({
        where: {
          user_id: userId,
          deleted_at: null,
        },
      })
    );
  }

  async deleteUser(userId: number): Promise<void> {
    const findUser: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!findUser) throw new UnauthorizedException('invalid user (session is not valid)');

    try {
      await this.userRepository.softDelete({ user_id: userId });
    } catch (e) {
      throw new InternalServerErrorException('server error');
    }
  }

  async verifyDuplicateNickname(nickname: string): Promise<VerifyNicknameResponseDto> {
    const user: User = await this.userRepository.findOne({
      where: {
        nickname: nickname,
      },
    });
    return {
      isDuplicate: !!user,
    };
  }

  async searchUser(userId: number, nickname: string): Promise<SearchUserResDto> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId }, relations: ['relationships'] });
    if (!user) throw new UnauthorizedException('invalid user (session is not valid)');
    const foundUsers: User[] = await this.userRepository.find({
      where: {
        nickname: Like(`%${nickname}%`),
      },
      select: ['user_id', 'nickname', 'profile_url'],
    });
    return {
      users: foundUsers
        .map((targetUser: User) => {
          const targetStatusArr = user.relationships.filter(
            (userRelations) => userRelations.target_id === targetUser.user_id
          ); // array -> 1, 0
          let status: RelationStatus;
          if (targetStatusArr[0]) status = targetStatusArr[0].status;
          else status = RelationStatus.NONE;
          return new SearchedUser(targetUser, status);
        })
        .filter((user: SearchedUser) => user.user_id !== userId),
    };
  }

  async getUserHistory(userId: number): Promise<GetUserHistoryResDto> {
    // NOTE: 해당 부분의 로직은 쿼리 최적화가 필요함
    // optimize below code
    const user: User = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!user) throw new BadRequestException('not exist user');
    // get all user's games
    const games: Match[] = await this.matchRepository.find({
      where: [
        {
          left_player: userId,
        },
        {
          right_player: userId,
        },
      ],
      take: 10,
      order: {
        created_at: 'DESC',
      },
      relations: ['lPlayer', 'rPlayer'],
      withDeleted: true,
    });
    const recentGames: GameHistoryDto[] = games.map((game) => {
      return {
        user_id: game.left_player === userId ? game.left_player : game.right_player,
        target_id: game.left_player === userId ? game.right_player : game.left_player,
        user_score: game.left_player === userId ? game.left_score : game.right_score,
        target_score: game.left_player === userId ? game.right_score : game.left_score,
        user_nickname: game.left_player === userId ? game.lPlayer.nickname : game.rPlayer.nickname,
        target_nickname: game.left_player === userId ? game.rPlayer.nickname : game.lPlayer.nickname,
      };
    });
    return {
      history: recentGames,
    };
  }
}
