
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
		role: RoleType;          // 현재 유저가 관리자인지 아닌지에 따라 메뉴 모양이 달라지기 때문에 필요
		status: UserStatus; 

	*/
	async getChatUsers(channel_id : number):Promise <ChannelUser[]> {

		const channelUserss = await this.channelUserRepository
      .createQueryBuilder("channel")
      .leftJoin("channel.user", "us") //innerjoin 으로 수정
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