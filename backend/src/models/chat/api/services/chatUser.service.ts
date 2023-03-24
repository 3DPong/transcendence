
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

		@InjectRepository(ChannelUser)
		private channelUserRepository: Repository<ChannelUser>
	) {}

	async getUser(user_id: number) :  Promise<User> {
		return await this.userRepository.findOne({ where: {user_id} });
	}


	/*

		id: number;
		name: string;
		profileURL: string;
		role: RoleType;         
		status: UserStatus; 

	*/
	async getChatUsers(channel_id : number):Promise <ChannelUser[]> {

		const channelUserss = await this.channelUserRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.user", "us") //innerjoin 으로 수정
      .select([
        "channel.user_id",
        "us.nickname",
        "us.profile_url",
        "channel.role"
      ])
      .where('channel.channel_id = :channel_id', {channel_id})
      .getMany();

		return channelUserss;
	}



}