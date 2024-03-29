import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../../common/guards/jwt/jwt.guard';
import { UserRelationService } from './services/userRelation.service';
import { GetGuardData } from '../../../common/decorators';
import { GetUserRelationResDto, UpdateUserRelationResDto, UpdateUserRelationReqDto } from './dtos';

@Controller('user_relation')
export class UserRelationController {
  constructor(private userRelationService: UserRelationService) {}

  @UseGuards(JwtGuard)
  @Get('/')
  async getUserRelation(
    @GetGuardData() sessionData,
    @Query('relation') relation: string
  ): Promise<GetUserRelationResDto> {
    switch (relation) {
      case 'friend': {
        return await this.userRelationService.getUserFriendRelation(sessionData.user_id);
      }
      case 'block': {
        return await this.userRelationService.getUserBlockRelation(sessionData.user_id);
      }
      default: {
        return await this.userRelationService.getUserAllRelation(sessionData.user_id);
      }
    }
  }

  @UseGuards(JwtGuard)
  @Put('/')
  async updateUserRelation(
    @GetGuardData() sessionData,
    @Body() payload: UpdateUserRelationReqDto
  ): Promise<UpdateUserRelationResDto> {
    return await this.userRelationService.updateUserRelation(sessionData.user_id, payload);
  }
}
