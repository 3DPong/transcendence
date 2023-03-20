import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { QueryFailedError, Repository } from 'typeorm';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserReqDto, CreateUserResDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from '../dtos';

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

  async createUser(data, payload: CreateUserReqDto): Promise<CreateUserResDto> {
    const newUser = new User();
    newUser.profile_url = payload.profile_url;
    newUser.nickname = payload.nickname;
    newUser.email = data.email;
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

  async updateUser(data, payload: UpdateUserReqDto): Promise<CreateUserResDto> {
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
    return 'success';
  }
}
