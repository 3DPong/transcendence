import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Res, UseGuards } from '@nestjs/common';
import { CreateUserReqDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from './dtos';
import { UserService } from './services';
import { UserCreationGuard } from '../../../common/guards/userCreation/userCreation.guard';
import { JwtGuard } from '../../../common/guards/jwt/jwt.guard';
import { GetGuardData } from '../../../common/decorators';
import { Response } from 'express';
import { TwoFactorService } from './services/twoFactor.service';
import { TokenDto } from '../../../auth/otp/token.dto';
import { GetUserSettingResDto } from './dtos/getUserSettingRes.dto';
import { JwtPayloadInterface } from '../../../common/interfaces/JwtUser.interface';
import { VerifyNicknameResponseDto } from './dtos/verifyNickname.dto';
import { SearchUserResDto } from './dtos/searchUserRes.dto';
import { TokenUserGuard } from '../../../common/guards/tokenUser/tokenUser.guard';
import { GetUserHistoryResDto } from './dtos/getUserHistoryRes.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService, private twoFactorService: TwoFactorService) {}

  @UseGuards(JwtGuard)
  @Get('/:userid')
  async getUser(
    @Param('userid', new ParseIntPipe({}))
    userid: number
  ): Promise<GetUserResDto> {
    return this.userService.getUser(userid);
  }

  @UseGuards(UserCreationGuard)
  @Post()
  async createUser(@GetGuardData() data: JwtPayloadInterface, @Body() payload: CreateUserReqDto): Promise<void> {
    return this.userService.createUser(data, payload);
  }

  @UseGuards(TokenUserGuard)
  @Get('/verify/nickname/:nickname')
  async verifyNickname(@Param('nickname') nickname: string): Promise<VerifyNicknameResponseDto> {
    return this.userService.verifyDuplicateNickname(nickname);
  }
  /**
   * 주의! GET /me 로 할경우 상위의 /user/:userId와 겹쳐서 사용할 수 없음.
   */
  @UseGuards(JwtGuard)
  @Get('/me/settings')
  async getMyUserSettings(@GetGuardData() data: JwtPayloadInterface): Promise<GetUserSettingResDto> {
    return this.userService.getMyUserSettings(data.user_id);
  }

  @UseGuards(JwtGuard)
  @Put('/me')
  async updateUser(
    @GetGuardData() data: JwtPayloadInterface,
    @Body() payload: UpdateUserReqDto
  ): Promise<UpdateUserResDto> {
    return this.userService.updateUser(data.user_id, payload);
  }

  @UseGuards(JwtGuard)
  @Delete('/me')
  async deleteUser(@GetGuardData() data: JwtPayloadInterface): Promise<void> {
    return this.userService.deleteUser(data.user_id);
  }

  @UseGuards(JwtGuard)
  @Get('/me/2fa/qr')
  async getQRCode(@GetGuardData() data: JwtPayloadInterface, @Res() res: Response): Promise<void> {
    return this.twoFactorService.getQRCode(data.user_id, res);
  }

  @UseGuards(JwtGuard)
  @Post('/me/2fa')
  async activateTwoFactor(@GetGuardData() data: JwtPayloadInterface, @Body() tokenDto: TokenDto): Promise<void> {
    return this.twoFactorService.activateUserTwoFactor(data.user_id, tokenDto.token);
  }

  @UseGuards(JwtGuard)
  @Delete('/me/2fa')
  async deactivateTwoFactor(@GetGuardData() data: JwtPayloadInterface, @Body() tokenDto: TokenDto): Promise<void> {
    return this.twoFactorService.deactivateUserTwoFactor(data.user_id, tokenDto.token);
  }

  @UseGuards(JwtGuard)
  @Get('/search/:searchString')
  async searchUser(
    @GetGuardData() data: JwtPayloadInterface,
    @Param('searchString') searchString: string
  ): Promise<SearchUserResDto> {
    return this.userService.searchUser(data.user_id, searchString);
  }

  @UseGuards(JwtGuard)
  @Get('/:userId/history')
  async getUserHistory(@Param('userId') userId: number): Promise<GetUserHistoryResDto> {
    return await this.userService.getUserHistory(userId);
  }
}
