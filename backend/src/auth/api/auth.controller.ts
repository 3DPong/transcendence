import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { Repository } from 'typeorm';
import { FtGuard } from '../../common/guards/ft/ft.guard';
import { AuthService } from './services';
import { Request } from 'express';
import { GuardData } from '../../common/decorators/guardData.decorator';

@Controller('auth')
export class AuthController {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private authService: AuthService) {}

  @UseGuards(FtGuard)
  @Get('/signin/42')
  signIn() {}

  @UseGuards(FtGuard)
  @Get('/redirect/42')
  async ftRedirect(@GuardData() data, @Req() request: Request) {
    return this.authService.redirect(data, request);
  }
}
