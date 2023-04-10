import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { Repository } from 'typeorm';
import { FtGuard } from '../../common/guards/ft/ft.guard';
import { AuthService } from './services';
import { Response } from 'express';
import { TwoFactorGuard } from '../../common/guards/twoFactor/twoFactor.guard';
import { GetGuardData } from '../../common/decorators';
import { JwtGuard } from '../../common/guards/jwt/jwt.guard';
import { TokenDto } from '../otp/token.dto';
import { FtDataInterface } from '../../common/interfaces/FtData.interface';
import { JwtPayloadInterface } from '../../common/interfaces/JwtUser.interface';

@Controller('auth')
export class AuthController {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private authService: AuthService) {}

  // will be redirected to /auth/redirect/42
  @UseGuards(FtGuard)
  @Get('/signin/42')
  signIn() {
    return;
  }

  // will be redirected to front
  @UseGuards(FtGuard)
  @Get('/redirect/42')
  async ftRedirect(@GetGuardData() data: FtDataInterface, @Res() res: Response): Promise<void> {
    return this.authService.redirect(data, res);
  }

  // will be redirected to /
  @UseGuards(JwtGuard)
  @Get('/signout')
  signOut(@Res() res: Response): void {
    // client have to disconnect socket
    return this.authService.signOut(res);
  }

  // will be redirected to /
  @UseGuards(TwoFactorGuard)
  @Post('/2fa/otp')
  async validateOtp(
    @GetGuardData() data: JwtPayloadInterface,
    @Body() payload: TokenDto,
    @Res() res: Response
  ): Promise<void> {
    return await this.authService.validateOtp(data.user_id, payload.token, res);
  }
}
