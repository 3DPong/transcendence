import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { Repository } from 'typeorm';
import { FtGuard } from '../../common/guards/ft/ft.guard';
import { AuthService } from './services';
import { Request } from 'express';
import { GuardData } from '../../common/decorators/guardData.decorator';
import { TwoFactorGuard } from '../../common/guards/twoFactor/twoFactor.guard';
import { GetSessionData } from '../../common/decorators';
import { OtpService } from './services/otp.service';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private authService: AuthService,
    private otpService: OtpService
  ) {}

  @UseGuards(FtGuard)
  @Get('/signin/42')
  signIn() {}

  @UseGuards(FtGuard)
  @Get('/redirect/42')
  async ftRedirect(@GuardData() data, @Req() request: Request) {
    return this.authService.redirect(data, request);
  }

  @UseGuards(TwoFactorGuard)
  @Post('/2fa/activate')
  async activateTwoFactor(@GetSessionData() data, @Body() payload, @Req() req: Request): Promise<boolean> {
    return await this.otpService.validate(data.user_id, payload.token, req);
  }
}
