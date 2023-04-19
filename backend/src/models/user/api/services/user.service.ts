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
import { CreateUserReqDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from '../dtos';
import { GetUserSettingResDto } from '../dtos/getUserSettingRes.dto';
import { JwtPayloadInterface } from '../../../../common/interfaces/JwtUser.interface';
import { VerifyNicknameResponseDto } from '../dtos/verifyNickname.dto';
import { SearchedUser, SearchUserResDto } from '../dtos/searchUserRes.dto';
import { Notifier } from '../../../notifier/services/notifier.class';
import { TopicEnum } from '../../../notifier/enums/topic.enum';
import { ChannelEnum } from '../../../notifier/enums/channel.enum';
import { UserUpdateDto } from '../../../../common/interfaces/userUpdate.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private readonly notifier: Notifier) {}

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
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new UnauthorizedException('invalid user (session is not valid)');
    const foundUsers: User[] = await this.userRepository.find({
      where: {
        nickname: Like(`%${nickname}%`),
      },
      select: ['user_id', 'nickname', 'profile_url'],
      relations: ['relatedOf'],
    });
    return {
      users: foundUsers
        .map((user: User) => {
          return new SearchedUser(user);
        })
        .filter((user: SearchedUser) => user.user_id !== userId),
    };
  }
}
