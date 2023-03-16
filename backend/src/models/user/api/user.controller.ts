import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserResDto, GetUserResDto, CreateUserReqDto, UpdateUserReqDto, UpdateUserResDto } from './dtos';
import { UserService } from './services';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('/:userid')
  // guard for admin
  async getUser(@Param('userid') userid: number): Promise<GetUserResDto> {
    return this.userService.getUser(userid);
  }
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
