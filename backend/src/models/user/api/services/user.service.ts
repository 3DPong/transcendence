import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { QueryFailedError, Repository } from 'typeorm';
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

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

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
      await this.userRepository.update({ user_id: userId }, payload);
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
}
