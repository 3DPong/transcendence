import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { QueryFailedError, Repository } from 'typeorm';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserReqDto, CreateUserResDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from '../dtos';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async getUser(userId: number): Promise<GetUserResDto> {
    const user: User = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
    });
    return new GetUserResDto(user);
  }

  async createUser(payload: CreateUserReqDto): Promise<CreateUserResDto> {
    const newUser = new User();
    newUser.profile_url = payload.profile_url;
    newUser.nickname = payload.nickname;
    try {
      return new CreateUserResDto(await this.userRepository.save(newUser));
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('unique constraint') && error.message.includes('violates unique constraint')) {
          throw new ConflictException('duplicate nickname');
        }
      } else {
        throw new InternalServerErrorException('Database error');
      }
    }
  }

  async updateUser(userId: number, payload: UpdateUserReqDto): Promise<CreateUserResDto> {
    // check user is valid
    const userToUpdate: User = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
    });
    if (userToUpdate === null || userToUpdate === undefined) {
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

  async deleteUser(userId: number): Promise<string> {
    try {
      await this.userRepository.delete({ user_id: userId });
    } catch (e) {
      throw new BadRequestException('can not delete it');
    }
    return 'success';
  }
}
