import { Module } from '@nestjs/common';
import { MatchService } from './services';
import { MatchController } from './match.controller';

@Module({
  providers: [MatchService],
  controllers: [MatchController],
})
export class MatchModule {}
