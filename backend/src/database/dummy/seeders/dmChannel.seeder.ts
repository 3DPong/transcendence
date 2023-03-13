import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DmChannel } from '../../../models/chat/entities';
@Injectable()
export class DmChannelSeeder implements Seeder {
  constructor(@InjectRepository(DmChannel) private readonly dmChannelRepository: Repository<DmChannel>) {}

  seed(): Promise<any> {
    return this.dmChannelRepository.insert(DataFactory.createForClass(DmChannel).generate(10));
  }
  drop(): Promise<any> {
    return this.dmChannelRepository.delete({});
  }
}
