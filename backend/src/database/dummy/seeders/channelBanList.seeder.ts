import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelBanList } from '../../../models/chat/entities';

@Injectable()
export class ChannelBanListSeeder implements Seeder {
  constructor(
    @InjectRepository(ChannelBanList) private readonly channelBanListRepository: Repository<ChannelBanList>
  ) {}

  seed(): Promise<any> {
    return this.channelBanListRepository.insert(DataFactory.createForClass(ChannelBanList).generate(10));
  }

  drop(): Promise<any> {
    return this.channelBanListRepository.delete({});
  }
}
