import { Module } from '@nestjs/common';

import { MatchController } from './match.controller';
import { MatchService } from './services';

@Module({
  providers: [MatchService],
  controllers: [MatchController],
})
export class MatchModule {}
