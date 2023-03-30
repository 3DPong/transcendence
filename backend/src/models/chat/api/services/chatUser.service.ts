
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelUser } from '../../entities/channelUser.entity';
import { User } from 'src/models/user/entities';

@Injectable()
export class ChatUserService {

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,

	) {}

	async getUser(user_id: number) :  Promise<User> {
		return await this.userRepository.findOne({ where: {user_id} });
	}



}