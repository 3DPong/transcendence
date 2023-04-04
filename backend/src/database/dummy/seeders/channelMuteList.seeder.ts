import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMuteList } from '../../../models/chat/entities';
@Injectable()
export class ChannelMuteListSeeder implements Seeder {
  constructor(
    @InjectRepository(ChannelMuteList) private readonly channelBanListRepository: Repository<ChannelMuteList>
  ) {}

  seed(): Promise<any> {
    return this.channelBanListRepository.insert(DataFactory.createForClass(ChannelMuteList).generate(10));
  }
  drop(): Promise<any> {
    return this.channelBanListRepository.delete({});
  }
}
