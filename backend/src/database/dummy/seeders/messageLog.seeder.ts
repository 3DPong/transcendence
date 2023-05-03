import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageLog } from '../../../models/chat/entities';

@Injectable()
export class MessageLogSeeder implements Seeder {
  constructor(@InjectRepository(MessageLog) private readonly messageLogRepository: Repository<MessageLog>) {}

  seed(): Promise<any> {
    return this.messageLogRepository.insert(DataFactory.createForClass(MessageLog).generate(100));
  }

  drop(): Promise<any> {
    return this.messageLogRepository.delete({});
  }
}
