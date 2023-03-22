import { ConflictException, forwardRef, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChannelType, ChatChannel } from '../../entities/chatChannel.entity';
import * as bcrypt from 'bcryptjs';
import { ChannelDto, PasswordDto } from '../dto/create-channel.dto';
import { User } from 'src/models/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from './chatUser.service';
import { ChannelUser, ChannelUserRoles } from '../../entities/channelUser.entity';
import { DmChannel } from '../../entities/dmChannel.entity';
import { ChannelBanList } from '../../entities/channelBanList.entity';
import { ChannelMuteList } from '../../entities/channeMuteList.entity';
import { Response } from "express";
import { MessageLog } from '../../entities/messageLog.entity';
import { from } from 'rxjs';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(ChatChannel)
		private channelRepository: Repository<ChatChannel>,
		
		@InjectRepository(ChannelUser)
		private channelUserRepository: Repository<ChannelUser>,
		
		@InjectRepository(MessageLog)
		private messageLogRepository: Repository<MessageLog>,

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
			return cu;
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
		// .andWhere('title = "*:str*"')
		.orderBy("channel.channel_id", "DESC")
		.getMany();

		return channel;
	}

	/*
		id : number;               // MessageId
		sender : number;       // Sender UserId 
		content: string;          // 메시지 내용
		createdAt: ???;           // 메시지 생성 시각. 타입을 어떻게 넣을지 협의 필요.
		type : ChatType; 

	*/
	async getMessageLog(take: number = 10, skip : number = 0, channel_id : number, user_id: number) {
		
		const channel = await this.channelRepository.findOne({where :{channel_id}});
		if (!channel)
			throw new NotFoundException(`can't find chat Channel ${ channel_id}`);
		
		if (await this.chaekBanUser(channel_id, user_id))
			throw new UnauthorizedException('Baned User!');

		const messages : MessageLog[] = await this.messageLogRepository
		.createQueryBuilder("log")
		.innerJoin("log.channel", "channel")
		.select([
			"log.message_id",
			"log.user_id",
			"log.content",
			"log.created_at",
			"channel.type"
		])
		.where('log.channel_id = :channel_id', {channel_id})
		.orderBy("log.created_at", "DESC")
		.take(take)
		.skip(skip)
		.getMany()

		return messages;
		// const User : User[] = await 

		// return from(
		// 	this.messageLogRepository.findAndCount({ take, skip }).then(([data]) => {
		// 		return <MessageLog[]>data;
		// 	}),
		// );
	}

	async creatChatRoom(channelDto: ChannelDto, user: User) : Promise<ChatChannel> {		
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
		try {
			await this.channelRepository.save(channel);
			return channel;
		} catch (error) {
			console.log(error)
			if (error.code === '23505')
				throw new ConflictException('Existing Title');
			else
				throw new InternalServerErrorException();
		}
	}

	async updateChatRoom(channel_id: number, channelDto: ChannelDto, user: User) : Promise<void> {

			const { name, password, type } = channelDto;
			const channel = await this.channelRepository.findOne({where :{channel_id}});
			if (!channel)
				throw new NotFoundException(`can't find chat Channel ${ channel_id}`);

			if (channel.owner_id != user.user_id && !(await this.chaekUserAdmin(user.user_id, channel_id)))
				throw new NotFoundException(`Channel [ ${channel_id} ]'s User :${ user.user_id} has no Permission`);

			let hashedPassword = channel.password;
			if (channel.type != ChannelType.PROTECTED && type == ChannelType.PROTECTED){
				if (password == undefined) {
					throw new NotFoundException(`Can't find password`);
				}
				const salt = await bcrypt.genSalt();
				hashedPassword = await bcrypt.hash(password, salt);
			}
			channel.name = name;
			channel.type = type;
			channel.password = hashedPassword;
		try {
			await this.channelRepository.save(channel);
		} catch (error) {
			if (error.code === '23505')
				throw new ConflictException('Existing Title');
			else
				throw new InternalServerErrorException();
		}
	}

	async newChannelUser(channel_id: number, pd: PasswordDto, user_id: number) {

		console.log(`${user_id} and ${channel_id}`)
		const channel = await this.channelRepository.findOne({where :{channel_id}});
		if (!channel)
			throw new NotFoundException(`can't find chat Channel ${ channel_id}`);``

		const baned = await this.banRepository.findOne({where: {channel_id, user_id}});
		console.log(baned)
		if (baned) {
			const time = new Date();
			if (baned.end_at > time)
				throw new UnauthorizedException('Baned User!');
		}
		switch (channel.type) {
			case ChannelType.PRIVATE:
				throw new UnauthorizedException('No permission!');
			case ChannelType.DM:
				throw new UnauthorizedException('No permission!');
			case ChannelType.PROTECTED:
				if (!(await bcrypt.compare(pd.password, channel.password))) {
					throw new UnauthorizedException('Wrong password!');
				}
			default:
				const cu = this.channelUserRepository.create({ channel_id, user_id })
				await this.channelUserRepository.save(cu);
				console.log(cu)
				return cu;
			}
	}


	/*
		**leaveChannel**
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

			if (channel.owner_id === user_id) {
				const channelUsers : ChannelUser[]  = await this.channelUserRepository.find({where: {channel_id}, order: { created_at: "asc" }},);
				console.log(channelUsers)
				if (channelUsers.length === 0) {
					await this.channelRepository.softDelete(channel_id);
				}
				else {
					var admin = channelUsers.find((users) => (users.role == ChannelUserRoles.ADMIN)) 
		
					if (admin === undefined) {
						admin = channelUsers[0];
					}
					await this.channelUserRepository.delete({channel_id, user_id: admin.user_id});
					await this.channelRepository.update(channel_id, {owner_id : admin.user_id});
				}
			}
			else {
				const delUser = await this.channelUserRepository.findOne({where: {channel_id, user_id}});
				if (!delUser)
					throw new NotFoundException(`can't find ${ channel_id}'s user ${user_id}`);
				await this.channelUserRepository.softDelete({channel_id, user_id});
			}
		} catch (error) {
			console.log(error)
			throw new InternalServerErrorException();
		}
	}

	async getSerchChannels(str: string) : Promise <ChatChannel[]> {

		const channels: ChatChannel[] = await this.channelRepository
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
		.andWhere('channel.name LIKE :name', {name: `%${str}%`})
		.orderBy("channel.channel_id", "DESC")
		.getMany();

		return channels;
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

	async chaekBanUser(channel_id: number, user_id: number) : Promise <boolean> {
		const baned = await this.banRepository.findOne({where: {channel_id, user_id}});
		if (baned) {
			const time = new Date();
			if (baned.end_at > time)
				return true;
		}
		return false;
	}
}
