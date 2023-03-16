import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChannelType, ChatChannel } from '../../entities/chatChannel.entity';
import * as bcrypt from 'bcryptjs';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { User } from 'src/models/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(ChatChannel)
		private channelRepository: Repository<ChatChannel>
	){}



	async getAllChannels(): Promise <ChatChannel[]> {
		return this.channelRepository.find();
		//find 함수에 아무 인자가 없으면 모든 정보를 리턴한다.
	}

	async creatChatRoom(createChannelDto: CreateChannelDto, user: User) : Promise<ChatChannel> {
		const { name, password, type } = createChannelDto;
		let hashedPassword = null;
		console.log("Create user 222");
		if (type == ChannelType.PROTECTED){
			if (password == undefined) {
				throw new NotFoundException(`Can't find password`);
			}
			const salt = await bcrypt.genSalt();
			hashedPassword = await bcrypt.hash(password, salt);
		}

		const channel = this.channelRepository.create({
			name,
			password: hashedPassword,
			type,
			owner: user,
			owner_id: user.user_id
		})
		try {
			await this.channelRepository.save(channel);
			delete channel.password;
		} catch (error) {
			if (error.code === '23505')
				throw new ConflictException('Existing Title');
			else
				throw new InternalServerErrorException();
		}
		return channel;
	}

}
