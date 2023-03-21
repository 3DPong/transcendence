import { InjectRepository } from '@nestjs/typeorm';
import { RelationStatus, UserRelation } from '../../entities';
import { Not, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GetUserRelationResDto, UpdateUserRelationReqDto, UpdateUserRelationResDto, UserRelationDto } from '../dtos';

@Injectable()
export class UserRelationService {
  constructor(@InjectRepository(UserRelation) private userRelationRepository: Repository<UserRelation>) {}

  async getUserAllRelation(userId: number): Promise<GetUserRelationResDto> {
    const relations: UserRelationDto[] = await this.userRelationRepository.find({
      where: {
        user_id: userId,
        status: Not(RelationStatus.NONE),
      },
      select: ['target_id', 'status'],
    });
    return { relations: relations };
  }

  async getUserFriendRelation(userId: number): Promise<GetUserRelationResDto> {
    const relations: UserRelationDto[] = await this.userRelationRepository.find({
      where: {
        user_id: userId,
        status: RelationStatus.FRIEND,
      },
      select: ['target_id', 'status'],
    });
    return { relations: relations };
  }

  async getUserBlockRelation(userId: number): Promise<GetUserRelationResDto> {
    const relations: UserRelationDto[] = await this.userRelationRepository.find({
      where: {
        user_id: userId,
        status: RelationStatus.BLOCK,
      },
      select: ['target_id', 'status'],
    });
    return { relations: relations };
  }

  async updateUserRelation(userId: number, payload: UpdateUserRelationReqDto): Promise<UpdateUserRelationResDto> {
    if (payload.target_id === userId) {
      throw new BadRequestException('본인과의 관계는 설정 불가능합니다.');
    }
    return await this.userRelationRepository.save({
      user_id: userId,
      target_id: payload.target_id,
      status: payload.status,
    });
  }
}
