import { InjectRepository } from '@nestjs/typeorm';
import { RelationStatus, UserRelation } from '../../entities';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GetUserRelationResDto, UserRelationDto, UpdateUserRelationResDto, UpdateUserRelationReqDto } from '../dtos';

@Injectable()
export class UserRelationService {
  constructor(@InjectRepository(UserRelation) private userRelationRepository: Repository<UserRelation>) {}

  async getUserAllRelation(userId: number): Promise<GetUserRelationResDto> {
    const relations: UserRelationDto[] = await this.userRelationRepository.find({
      where: {
        user_id: userId,
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
    const update: UserRelation = await this.userRelationRepository.save({
      user_id: userId,
      target_id: payload.target_id,
      status: payload.status,
    });
    return {
      target_id: update.user_id,
      status: update.status,
    };
  }
}
