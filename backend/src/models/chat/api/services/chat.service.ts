import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChannelType, ChatChannel } from '../../entities/chatChannel.entity';
import * as bcrypt from 'bcryptjs';
import { ChannelDto } from '../dto/create-channel.dto';
import { User } from 'src/models/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from './chatUser.service';
import { ChannelUser, ChannelUserRoles } from '../../entities/channelUser.entity';
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

		// async getAllChannels(): Promise <ChatChannel[]> {

		// 	const channel: ChatChannel[] = await this.channelRepository
		// 	.createQueryBuilder("channel")
		// 	.where('channel.type != :type', {type: ChannelType.PRIVATE})
		// 	.orderBy("channel.channel_id", "DESC")
		// 	.getMany();

		// 	return channel;
		// }
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
			.orderBy("channel.channel_id", "DESC")
			.getMany();

			return channel;
		}

	async creatChatRoom(channelDto: ChannelDto, user: User) : Promise<ChatChannel> {		
		try {
			const { name, password, type } = channelDto;
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
			await this.channelRepository.save(channel);
			return channel;
		} catch (error) {

			if (error.code === '23505')
				throw new ConflictException('Existing Title');
			else
				throw new InternalServerErrorException();
		}
	}

	async updateChatRoom(channel_id: number, channelDto: ChannelDto, user: User) : Promise<void> {
		try {
			const { name, password, type } = channelDto;
			const channel = await this.channelRepository.findOne({where :{channel_id}});
			if (!channel)
				throw new NotFoundException(`can't find chat Channel ${ channel_id}`);

			if (channel.owner_id != user.user_id && !(await this.chaekUserAdmin(user.user_id, channel_id)))
				throw new NotFoundException(`Channel [ ${channel_id} ]'s User :${ user.user_id} has no Permission`);

			let hashedPassword = channel.password;
			if (type == ChannelType.PROTECTED){
				if (password == undefined) {
					throw new NotFoundException(`Can't find password`);
				}
				const salt = await bcrypt.genSalt();
				hashedPassword = await bcrypt.hash(password, salt);
			}
			channel.name = name;
			channel.type = type;
			channel.password = hashedPassword;

			await this.channelRepository.save(channel);
		} catch (error) {
			if (error.code === '23505')
				throw new ConflictException('Existing Title');
			else
				throw new InternalServerErrorException();
		}
	}

	/*
		1. 내가 owner 
			해당 room 에 포함된 user 목록 가져옴
				a. user 목록이 없으면 chatChannel 삭제
				b. user 목록이 있고 admin이 있으면 랜덤하게 양도
				c. user 목록이 있고 admin 이 없으면 랜덤하게 admin 지정후 양도
			
		2. 내가 admin or user
			channelUser 데이터 삭제
	
	*/
	async leaveChannel(user_id: number, channel_id: number){
		try {
			console.log(`${user_id} and ${channel_id}`)
			const channel = await this.channelRepository.findOne({where :{channel_id}});
			if (!channel)
				throw new NotFoundException(`can't find chat Channel ${ channel_id}`);
			console.log("111111111111")
			const channelUsers : ChannelUser[]  = await this.channelUserRepository.find({where: {channel_id}, order: { created_at: "asc" }},);
			if (channel.owner_id === user_id) {
				console.log("222222221")

				if (channelUsers.length === 0) {
					await this.channelRepository.softDelete(channel_id);
					return ;
				}
				else {
					console.log(channelUsers)
					console.log(channelUsers[0].role)
					var admin;
					channelUsers.map((users) => {
						if (users.role == ChannelUserRoles.ADMIN) {
							admin = user_id;
						}
					});
					if (admin === undefined)
					{
						channelUsers[0].role = ChannelUserRoles.ADMIN;
						// await this.channelUserRepository.createQueryBuilder('cu')
						// .where	

						// await this.channelUserRepository.update({user_id, channel_id}, {channelUsers[0].role}});


						// 	.update({
						// 		where : {channel_id: channelUsers[0].channel_id, user_id: channelUsers[0].user_id},

						// 	});
						// channelUsers.values
						// const role = ChannelUserRoles.ADMIN;
						// await this.channelUserRepository.update()
					}
				}
			}
			else {
				await this.channelUserRepository.softDelete({channel_id, user_id});
			}
		} catch (error) {
			throw new InternalServerErrorException();
		}
	}

	async deleteChatRoom(channel_id: number) : Promise <void> {
		const result = await this.channelRepository.delete({channel_id});
		if (result.affected === 0)
			throw new NotFoundException(`Cant't find id ${channel_id}`)
	console.log('result', result);
	}

	async chaekUserAdmin(user_id: number, channel_id: number) : Promise <boolean> {
		const channelUser = await this.channelUserRepository.findOne({where: {user_id, channel_id}});
		if (!channelUser || channelUser.role == ChannelUserRoles.USER)
			return false;
		return true;
	}
}
