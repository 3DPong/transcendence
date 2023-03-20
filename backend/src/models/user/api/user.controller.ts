import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateUserResDto, GetUserResDto, CreateUserReqDto, UpdateUserReqDto, UpdateUserResDto } from './dtos';
import { UserService } from './services';
import { UserCreationGuard } from '../../../common/guards/signup.guard.ts/userCreation.guard';
import { SessionGuard } from '../../../common/guards/session/session.guard';
import { GetSessionData } from '../../../common/decorators';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(SessionGuard)
  @Get('/:userid')
  // guard for admin
  async getUser(@Param('userid') userid: number): Promise<GetUserResDto> {
    return this.userService.getUser(userid);
  }

  @UseGuards(UserCreationGuard)
  @Post()
  async createUser(
    @GetSessionData() data,
    @Body() payload: CreateUserReqDto,
    @Req() req: Request
  ): Promise<CreateUserResDto> {
    return this.userService.createUser(data, payload, req);
  }

  @UseGuards(SessionGuard)
  @Put()
  async updateUser(@GetSessionData() data, @Body() payload: UpdateUserReqDto): Promise<UpdateUserResDto> {
    return this.userService.updateUser(data, payload);
  }

  @UseGuards(SessionGuard)
  @Delete()
  async deleteUser(@GetSessionData() data, @Req() request: Request): Promise<string> {
    return this.userService.deleteUser(data.user_id, request);
  }
}
