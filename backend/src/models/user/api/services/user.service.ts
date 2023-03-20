import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserReqDto, CreateUserResDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from '../dtos';
import { SessionService } from '../../../../common/session/session.service';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
    private sessionService: SessionService
  ) {}

  async getUser(userId: number): Promise<GetUserResDto> {
    const user: User = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!user) return;
    return new GetUserResDto(user);
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

  async updateUser(data, payload: UpdateUserReqDto): Promise<UpdateUserResDto> {
    // check user is valid
    const userId = data.user_id;
    const userToUpdate: User = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!userToUpdate) {
      throw new BadRequestException('not exist user');
    }

    try {
      await this.userRepository.update({ user_id: userId }, payload);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('unique constraint') && error.message.includes('violates unique constraint')) {
          throw new ConflictException('duplicate nickname');
        }
      } else {
        throw new InternalServerErrorException('Database error');
      }
    }
    return new UpdateUserResDto(
      await this.userRepository.findOne({
        where: {
          user_id: userId,
        },
      })
    );
  }

  async deleteUser(userId: number, req: Request): Promise<string> {
    try {
      await this.userRepository.delete({ user_id: userId });
      await this.sessionService.destroySessionByUserId(userId, req);
      return 'deleted';
    } catch (e) {
      throw new BadRequestException('can not delete it');
    }
  }
}
