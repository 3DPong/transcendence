import { Body, Controller, Get, Post, Query, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
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
import { EmailReqDto } from 'src/models/user/api/dtos/verifyEmailReq.dto';
import { VerifyEmailToken } from 'src/models/user/api/dtos/VerifyEmailToken.dto';

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
    try {
      return await this.authService.redirect(data, res);
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        res.redirect('/signin_duplicated');
      } else {
        res.redirect('/signin_fail');
      }
    }
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

  @UseGuards(TwoFactorGuard)
  @Post('/signin/email')
  async verifyEmail(
    @Body() payload: EmailReqDto,
    @Res() res: Response
  ): Promise<void> {
    return await this.authService.verifyEmail(payload.email, res);
  }


  @Post('/email-verify')
  async confirmEmail(
    @Query() dto: VerifyEmailToken,
    @Res() res: Response
  ): Promise<void> {
    const {signupVerifyToken} = dto;
    return await this.authService.confirmEmailToken(signupVerifyToken, res);
  }


  

}
