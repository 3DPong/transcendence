import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateUserResDto, GetUserResDto, CreateUserReqDto, UpdateUserReqDto, UpdateUserResDto } from './dtos';
import { UserService } from './services';
import { UserCreationGuard } from '../../../common/guards/signup.guard.ts/userCreation.guard';
import { SessionGuard } from '../../../common/guards/session/session.guard';
import { GetSessionData } from '../../../common/decorators';

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
  async createUser(@GetSessionData() data, @Body() payload: CreateUserReqDto): Promise<CreateUserResDto> {
    return this.userService.createUser(data, payload);
  }

  @UseGuards(SessionGuard)
  @Put()
  async updateUser(@GetSessionData() data, @Body() payload: UpdateUserReqDto): Promise<UpdateUserResDto> {
    return this.userService.updateUser(data, payload);
  }

  @UseGuards(SessionGuard)
  @Delete('/:userid')
  async deleteUser(@Param('userid') userid: number): Promise<string> {
    return this.userService.deleteUser(userid);
  }
}
