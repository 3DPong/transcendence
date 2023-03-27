import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { CreateUserResDto, GetUserResDto, CreateUserReqDto, UpdateUserReqDto, UpdateUserResDto } from './dtos';
import { UserService } from './services';
import { UserCreationGuard } from '../../../common/guards/userCreation/userCreation.guard';
import { SessionGuard } from '../../../common/guards/session/session.guard';
import { GetSessionData } from '../../../common/decorators';
import { Request, Response } from 'express';
import { GuardData } from '../../../common/decorators/guardData.decorator';
import { TwoFactorService } from './services/twoFactor.service';
import { TokenDto } from '../../../common/otp/token.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService, private twoFactorService: TwoFactorService) {}

  @UseGuards(SessionGuard)
  @Get('/:userid')
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

  @UseGuards(SessionGuard)
  @Get('/2fa/qr')
  async getQRCode(@GuardData() data, @Req() req: Request, @Res() res: Response): Promise<void> {
    return this.twoFactorService.getQRCode(data.user_id, req, res);
  }

  @UseGuards(SessionGuard)
  @Post('/2fa/activate')
  async activateTwoFactor(
    @GuardData() data,
    @Body() tokenDto: TokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    return this.twoFactorService.activateUserTwoFactor(data.user_id, tokenDto.token, req, res);
  }

  @UseGuards(SessionGuard)
  @Put('/2fa/deactivate')
  async deactivateTwoFactor(
    @GuardData() data,
    @Body() tokenDto: TokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    return this.twoFactorService.deactivateUserTwoFactor(data.user_id, tokenDto.token, req, res);
  }
}
