import { Controller, Get, Query, Req } from '@nestjs/common';
import { DevService } from './dev.service';
import { Request } from 'express';

/**
 * 개발용으로 세션 획득을 간단하게 수행하기 위함.
 */
@Controller('dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  /**
   * 로그인이 되어있는 세션을 획득함.
   */
  @Get('/session/signin')
  async getSignInSession(
    @Req() req: Request,
    @Query('email') email: string,
    @Query('nickname') nickname: string,
    @Query('userid') userId: number
  ) {
    return this.devService.getSignInSession(req, email, nickname, userId);
  }

  /**
   * 회원가입을 할 수 있는 세션을 획득함.
   */
  @Get('/session/signup')
  async getSignUpSession(@Req() req: Request, @Query('email') email: string) {
    return this.devService.getSignUpSession(req, email);
  }
}
