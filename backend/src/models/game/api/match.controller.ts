import { Body, Controller, Post } from '@nestjs/common';
import { MatchService } from './services';

@Controller('game')
export class MatchController {
  constructor(private matchService : MatchService){}

  @Post('/join')
  joinMatchList(@Body() socketId: number){
    this.matchService.joinMatchList(socketId);
  }

  @Post('/exit')
  exitMatchList(@Body() socketId: number){
    this.matchService.exitMatchList(socketId);
  }
  //게임 시작한거 어떻게 알려줘야하지?
}
