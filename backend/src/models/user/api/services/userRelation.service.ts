import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRelation } from '../../entities';
import { FindOperator, Not, QueryFailedError, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GetUserRelationResDto, UpdateUserRelationReqDto, UpdateUserRelationResDto } from '../dtos';
import { RelationStatus } from '../../../../common/enums/relationStatus.enum';

@Injectable()
export class UserRelationService {
  constructor(@InjectRepository(UserRelation) private userRelationRepository: Repository<UserRelation>) {}

  async getUserRelations(
    userId: number,
    status: RelationStatus | FindOperator<RelationStatus>
  ): Promise<GetUserRelationResDto> {
    const relations: UserRelation[] = await this.userRelationRepository.find({
      where: {
        user_id: userId,
        status: status,
      },
      select: ['target_id', 'status'],
      relations: ['target'],
    });
    return {
      relations: relations.map((relation: UserRelation) => {
        const user: User = relation.target;
        return {
          target_id: user.user_id,
          nickname: user.nickname,
          profile_url: user.profile_url,
          relation: relation.status,
          status: user.status,
        };
      }),
    };
  }

  async getUserAllRelation(userId: number): Promise<GetUserRelationResDto> {
    return this.getUserRelations(userId, Not(RelationStatus.NONE));
  }

  async getUserFriendRelation(userId: number): Promise<GetUserRelationResDto> {
    return this.getUserRelations(userId, RelationStatus.FRIEND);
  }

  async getUserBlockRelation(userId: number): Promise<GetUserRelationResDto> {
    return this.getUserRelations(userId, RelationStatus.BLOCK);
  }

  async updateUserRelation(userId: number, payload: UpdateUserRelationReqDto): Promise<UpdateUserRelationResDto> {
    if (payload.target_id === userId) {
      throw new BadRequestException('본인과의 관계는 설정 불가능합니다.');
    }
    try {
      return await this.userRelationRepository.save({
        user_id: userId,
        target_id: payload.target_id,
        status: payload.status,
      });
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new BadRequestException('없는 유저와의 관계는 불가능합니다.');
      }
    }
  }
}
