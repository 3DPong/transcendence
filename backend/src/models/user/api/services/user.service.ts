import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserReqDto, CreateUserResDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from '../dtos';
import { SessionService } from '../../../../common/session/session.service';
import { Request, Response } from 'express';
import { GetUserSettingResDto } from '../dtos/getUserSettingResDto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
    private sessionService: SessionService
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

  async createUser(data, payload: CreateUserReqDto, req: Request): Promise<CreateUserResDto> {
    const newUser = new User();
    let savedUser;
    newUser.profile_url = payload.profile_url;
    newUser.nickname = payload.nickname;
    newUser.email = data.email;

    const runner = await this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      savedUser = await runner.manager.save(newUser);
      this.sessionService.createSession(savedUser, req);
      await runner.commitTransaction();
      return {
        user_id: savedUser.user_id,
      };
    } catch (error) {
      await runner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        if (error.message.includes('unique constraint') && error.message.includes('violates unique constraint')) {
          throw new ConflictException('duplicate nickname');
        } else {
          throw new InternalServerErrorException('Database error');
        }
      } else {
        throw new InternalServerErrorException('session error');
      }
    } finally {
      await runner.release();
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

  async deleteUser(userId: number, req: Request, res: Response): Promise<void> {
    const findUser: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!findUser) throw new UnauthorizedException('invalid user (session is not valid)');

    const runner = await this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.manager.softDelete(User, { user_id: userId });
      this.sessionService.clearSession(req, res);
      await runner.commitTransaction();
    } catch (e) {
      await runner.rollbackTransaction();
      throw new InternalServerErrorException('server error');
    } finally {
      await runner.release();
    }
  }
}
