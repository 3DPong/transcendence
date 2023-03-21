import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../../../common/guards/session/session.guard';
import { UserRelationService } from './services/userRelation.service';
import { GetSessionData } from '../../../common/decorators';
import { GetUserRelationResDto, UpdateUserRelationResDto, UpdateUserRelationReqDto } from './dtos';

@Controller('user/relation')
export class UserRelationController {
  constructor(private userRelationService: UserRelationService) {}

  @UseGuards(SessionGuard)
  @Get('/')
  async getUserRelation(
    @GetSessionData() sessionData,
    @Query('relation') relation: string
  ): Promise<GetUserRelationResDto> {
    switch (relation) {
      case 'friend': {
        return await this.userRelationService.getUserAllRelation(sessionData.user_id);
      }
      case 'block': {
        return await this.userRelationService.getUserFriendRelation(sessionData.user_id);
      }
      default: {
        return await this.userRelationService.getUserBlockRelation(sessionData.user_id);
      }
    }
  }

  @UseGuards(SessionGuard)
  @Put('/')
  async updateUserRelation(
    @GetSessionData() sessionData,
    @Body() payload: UpdateUserRelationReqDto
  ): Promise<UpdateUserRelationResDto> {
    return await this.userRelationService.updateUserRelation(sessionData.user_id, payload);
  }
}
