import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { Repository } from 'typeorm';
import { FtGuard } from '../../common/guards/ft/ft.guard';
import { AuthService } from './services';
import { Request, Response } from 'express';
import { GuardData } from '../../common/decorators/guardData.decorator';
import { TwoFactorGuard } from '../../common/guards/twoFactor/twoFactor.guard';
import { GetSessionData } from '../../common/decorators';
import { SessionGuard } from '../../common/guards/session/session.guard';

@Controller('auth')
export class AuthController {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private authService: AuthService) {}

  @UseGuards(FtGuard)
  @Get('/signin/42')
  signIn() {
    return;
  }

  @UseGuards(FtGuard)
  @Get('/redirect/42')
  async ftRedirect(@GuardData() data, @Req() request: Request) {
    return this.authService.redirect(data, request);
  }

  @UseGuards(TwoFactorGuard)
  @Post('/2fa/otp')
  async validateOtp(@GetSessionData() data, @Body() payload: { token: string }, @Req() req: Request): Promise<boolean> {
    return await this.authService.validateOtp(data.user_id, payload.token, req);
  }

  @UseGuards(SessionGuard)
  @Get('/signout')
  async signOut(@GetSessionData() data, req: Request, res: Response): Promise<void> {
    return await this.authService.signOut(data.user_id, req, res);
  }
}
