import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { User } from '../../../models/user/entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  seed(): Promise<any> {
    return this.userRepository.insert(DataFactory.createForClass(User).generate(100));
  }

  drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}
