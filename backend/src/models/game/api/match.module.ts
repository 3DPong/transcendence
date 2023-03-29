import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';

@Module({
  providers: [MatchService],
  controllers: [MatchController],
})
export class MatchModule {}
