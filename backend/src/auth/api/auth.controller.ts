import { BadRequestException, Body, Controller, Get, Post, Query, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { Repository } from 'typeorm';
import { FtGuard } from '../../common/guards/ft/ft.guard';
import { AuthService } from './services';
import { Response } from 'express';
import { TwoFactorGuard } from '../../common/guards/twoFactor/twoFactor.guard';
import { GetGuardData } from '../../common/decorators';
import { JwtGuard } from '../../common/guards/jwt/jwt.guard';
import { KakaoGuard } from '../../common/guards/kakao/kakao.guard';
import { GoogleGuard } from '../../common/guards/google/google.guard';
import { NaverGuard } from '../../common/guards/naver/naver.guard';
import { TokenDto } from '../otp/token.dto';
import { FtDataInterface } from '../../common/interfaces/FtData.interface';
import { JwtPayloadInterface } from '../../common/interfaces/JwtUser.interface';
import { EmailReqDto } from '../../models/user/api/dtos/verifyEmailReq.dto';
import { VerifyEmailToken } from '../../models/user/api/dtos/verifyEmailToken.dto';

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


  @Post('/signin/email')
  async verifyEmail(
    @Body() payload: EmailReqDto,
    @Res() res: Response
  ): Promise<void> {
    return await this.authService.verifyEmail(payload.email, res);
  }


  @Post('/emailVerify')
  async confirmEmail(
    @Body() dto: VerifyEmailToken,
    @Res() res: Response
  ){
    try {
      await this.authService.confirmEmailToken(dto, res);
      return this.authService.redirectEmail(dto.email, res);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw new BadRequestException('비밀번호가 일치하지 않습니다!');
      } else if (e instanceof UnauthorizedException) {
        res.status(400).json({redirectURL: '/signin_duplicated'});
      } else {
        res.status(400).json({redirectURL: '/signin_fail'});
      }
    }
  }

  @UseGuards(KakaoGuard)
  @Get('/signin/kakao')
  loginKakao() {
    return;
  }

  @UseGuards(KakaoGuard)
  @Get("/redirect/kakao")
  async kakaoRedirect(
    @GetGuardData() data: FtDataInterface,
    @Res() res: Response
  ) {
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

  @UseGuards(GoogleGuard)
  @Get('/signin/google')
  loginGoogle() {
    return;
  }

  @UseGuards(GoogleGuard)
  @Get("/redirect/google")
  async googleRedirect(
    @GetGuardData() data: FtDataInterface,
    @Res() res: Response
  ) {
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

  @UseGuards(NaverGuard)
  @Get('/signin/naver')
  loginNaver() {
    return;
  }

  @UseGuards(NaverGuard)
  @Get("/redirect/naver")
  async naverRedirect(
    @GetGuardData() data: FtDataInterface,
    @Res() res: Response
  ) {
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
}
