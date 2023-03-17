import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateUserResDto, GetUserResDto, CreateUserReqDto, UpdateUserReqDto, UpdateUserResDto } from './dtos';
import { UserService } from './services';
import { UserCreationGuard } from '../../../common/guards/signup.guard.ts/userCreation.guard';
import { SessionGuard } from '../../../common/guards/session/session.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(SessionGuard)
  // @UseGuards(UserCreationGuard)
  @Get('/:userid')
  // guard for admin
  async getUser(@Param('userid') userid: number): Promise<GetUserResDto> {
    return this.userService.getUser(userid);
  }

  // @UseGuards(SessionGuard)
  @UseGuards(UserCreationGuard)
  @Get('/test/test')
  // guard for admin
  async test() {
    return;
  }

  @UseGuards(UserCreationGuard)
  @Post()
  // session guard, get user unique name(intra name or email) from session.
  async createUser(@Body() payload: CreateUserReqDto): Promise<CreateUserResDto> {
    return this.userService.createUser(payload);
  }

  @Put('/:userId')
  // guard for admin
  async updateUser(@Param('userid') userId: number, @Body() payload: UpdateUserReqDto): Promise<UpdateUserResDto> {
    return this.userService.updateUser(userId, payload);
  }

  @Delete('/:userid')
  // guard for admin
  async deleteUser(@Param('userid') userid: number): Promise<string> {
    return this.userService.deleteUser(userid);
  }
}
