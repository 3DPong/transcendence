import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { UserRelation } from '../../../models/user/entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRelationSeeder implements Seeder {
  constructor(@InjectRepository(UserRelation) private readonly userRelationRepository: Repository<UserRelation>) {}

  seed(): Promise<any> {
    return this.userRelationRepository.insert(DataFactory.createForClass(UserRelation).generate(10));
  }
  drop(): Promise<any> {
    return this.userRelationRepository.delete({});
  }
}
