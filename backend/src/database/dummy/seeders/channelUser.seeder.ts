import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelUser } from '../../../models/chat/entities';

@Injectable()
export class ChannelUserSeeder implements Seeder {
  constructor(@InjectRepository(ChannelUser) private readonly channelUserRepository: Repository<ChannelUser>) {}

  seed(): Promise<any> {
    return this.channelUserRepository.insert(DataFactory.createForClass(ChannelUser).generate(10));
  }

  drop(): Promise<any> {
    return this.channelUserRepository.delete({});
  }
}
