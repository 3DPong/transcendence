import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../../../models/game/entities';

@Injectable()
export class MatchSeeder implements Seeder {
  constructor(@InjectRepository(Match) private readonly matchRepository: Repository<Match>) {}

  seed(): Promise<any> {
    return this.matchRepository.insert(DataFactory.createForClass(Match).generate(100));
  }

  drop(): Promise<any> {
    return this.matchRepository.delete({});
  }
}
