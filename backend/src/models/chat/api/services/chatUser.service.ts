
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ChatUserService {

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>
	){}

	async getUserOne(user_id: number) :  Promise<User> {
		return await this.userRepository.findOne({ where: {user_id} });
	}
}