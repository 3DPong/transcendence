import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatChannel } from '../../../models/chat/entities';

@Injectable()
export class ChatChannelSeeder implements Seeder {
  constructor(@InjectRepository(ChatChannel) private readonly chatChannelRepository: Repository<ChatChannel>) {}

  seed(): Promise<any> {
    return this.chatChannelRepository.insert(DataFactory.createForClass(ChatChannel).generate(100));
  }

  drop(): Promise<any> {
    return this.chatChannelRepository.delete({});
  }
}
