import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { CreateUserResDto, GetUserResDto, CreateUserReqDto, UpdateUserReqDto, UpdateUserResDto } from './dtos';
import { UserService } from './services';
import { UserCreationGuard } from '../../../common/guards/userCreation/userCreation.guard';
import { SessionGuard } from '../../../common/guards/session/session.guard';
import { GetSessionData } from '../../../common/decorators';
import { Request, Response } from 'express';
import { GuardData } from '../../../common/decorators/guardData.decorator';
import { TwoFactorService } from './services/twoFactor.service';
import { TokenDto } from '../../../auth/otp/token.dto';
import { GetUserSettingResDto } from './dtos/getUserSettingResDto';

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

  /**
   * 주의! GET /me 로 할경우 상위의 /user/:userId와 겹쳐서 사용할 수 없음.
   */
  @UseGuards(SessionGuard)
  @Get('/me/settings')
  async getMyUserSettings(@GetSessionData() data): Promise<GetUserSettingResDto> {
    return this.userService.getMyUserSettings(data.user_id);
  }

  @UseGuards(SessionGuard)
  @Put('/me')
  async updateUser(@GetSessionData() data, @Body() payload: UpdateUserReqDto): Promise<UpdateUserResDto> {
    return this.userService.updateUser(data.user_id, payload);
  }

  @UseGuards(SessionGuard)
  @Delete('/me')
  async deleteUser(@GetSessionData() data, @Req() request: Request, @Res() response: Response): Promise<void> {
    return this.userService.deleteUser(data.user_id, request, response);
  }

  @UseGuards(SessionGuard)
  @Get('/me/2fa/qr')
  async getQRCode(@GuardData() data, @Req() req: Request, @Res() res: Response): Promise<void> {
    return this.twoFactorService.getQRCode(data.user_id, req, res);
  }

  @UseGuards(SessionGuard)
  @Post('/me/2fa')
  async activateTwoFactor(
    @GuardData() data,
    @Body() tokenDto: TokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    return this.twoFactorService.activateUserTwoFactor(data.user_id, tokenDto.token, req, res);
  }

  @UseGuards(SessionGuard)
  @Delete('/me/2fa')
  async deactivateTwoFactor(
    @GuardData() data,
    @Body() tokenDto: TokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    return this.twoFactorService.deactivateUserTwoFactor(data.user_id, tokenDto.token, req, res);
  }
}
