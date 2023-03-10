import { Module } from '@nestjs/common';
import { AlramGateway } from './alram.gateway';
import { AlramService } from './alram.service';

@Module({
  providers: [AlramGateway, AlramService]
})
export class AlramModule {}
