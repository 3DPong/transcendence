import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChannelType, ChatChannel } from '../../entities/chatChannel.entity';
import * as bcrypt from 'bcryptjs';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { User } from 'src/models/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from './chatUser.service';
import { ChannelUser } from '../../entities/channelUser.entity';
import { DmChannel } from '../../entities/dmChannel.entity';
import { ChannelBanList } from '../../entities/channelBanList.entity';
import { ChannelMuteList } from '../../entities/channeMuteList.entity';


@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(ChatChannel)
		private channelRepository: Repository<ChatChannel>,
		
		@InjectRepository(ChannelUser)
		private channelUserRepository: Repository<ChannelUser>,
		
		@InjectRepository(DmChannel)
		private dmRepository: Repository<DmChannel>,

		@InjectRepository(ChannelBanList)
		private banRepository: Repository<ChannelBanList>,

		@InjectRepository(ChannelMuteList)
		private muteRepository: Repository<ChannelMuteList>,
		
		@Inject(forwardRef(() => ChatUserService))
		private readonly userService: ChatUserService,
	){}

	async createChannelUser(user_id: number, channel_id: number) {
	
			const cu = this.channelUserRepository.create({
				channel_id: channel_id,
				user_id : user_id
			})
			await this.channelUserRepository.save(cu);
		}

		async getOneChannel(id: number): Promise <ChatChannel> {

			const channel: ChatChannel = await this.channelRepository
			.createQueryBuilder("channel")
			.innerJoin("channel.owner", "owner")
			.select([
				"channel.channel_id",
				"channel.name",
				"channel.type",
				"owner.user_id",
				"owner.nickname",
				"owner.profile_url"
			])
			.where("channel.channel_id = :id", {id})
			.getOne();

			console.log(channel)
			return channel;
		}
	
		async getMyChannels(user_id: number): Promise<ChatChannel[]> {

			const channelUserss : ChannelUser[]  = await this.channelUserRepository
			.createQueryBuilder("cu")
			.select("cu.channel_id")
			.where('cu.user_id = :user_id', {user_id})
			.getMany();

			var arr = [];
			channelUserss.map((cu) =>arr.push(cu.channel_id));

			const channel: ChatChannel[] = await this.channelRepository
			.createQueryBuilder("channel")
			.innerJoin("channel.owner", "owner")
			.select([
				"channel.channel_id",
				"channel.name",
				"channel.type",
				"owner.user_id",
				"owner.nickname",
				"owner.profile_url"
			])
			.whereInIds(arr)
			.orWhere("channel.owner_id = :id", {id: user_id})
			.getMany();

			return channel;
		}


	async getAllChannels(): Promise <ChatChannel[]> {

		const channel: ChatChannel[] = await this.channelRepository
		.createQueryBuilder("channel")
		.innerJoin("channel.owner", "owner")
		.select([
			"channel.channel_id",
			"channel.name",
			"channel.type",
			"owner.user_id",
			"owner.nickname",
			"owner.profile_url"
		])
		.where('channel.type != :type', {type: ChannelType.PRIVATE})
		.getMany();

		return channel;
	}

	async creatChatRoom(createChannelDto: CreateChannelDto, user: User) : Promise<ChatChannel> {
		
		const { name, password, type } = createChannelDto;
		let hashedPassword = null;

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
