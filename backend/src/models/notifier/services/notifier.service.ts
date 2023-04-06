import { Injectable, Logger } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TopicEnum } from '../enums/topic.enum';
import { FindOptionsRelations, Repository } from 'typeorm';
import { User } from '../../user/entities';
import { RelationStatus } from '../../../common/enums/relationStatus.enum';
import { ChatChannel } from '../../chat/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotifyGateway } from '../userNotify.gateway';

@Injectable()
export class NotifierService {
  @WebSocketServer()
  chatServer: Server;
  private readonly logger = new Logger('NotifierService');

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ChatChannel) private readonly chatChannelRepository: Repository<ChatChannel>,
    private readonly userNotifyGateway: UserNotifyGateway
  ) {}

  async getUser(userId: number, relations: FindOptionsRelations<User>) {
    return await this.userRepository.findOne({
      where: { user_id: userId },
      relations: relations,
    });
  }

  async getFollowers(user: User) {
    return user.relatedOf
      .filter((relationship) => relationship.status === RelationStatus.FRIEND)
      .map((relationship) => relationship.user_id);
  }
  async getFollowings(user: User) {
    return user.relationships
      .filter((relationship) => relationship.status === RelationStatus.FRIEND)
      .map((relationship) => relationship.target_id);
  }

  async getJoinedChannels(user: User) {
    return user.joinChannels.map((channel) => channel.channel_id);
  }

  async notifyAll(userId: number, event: string, data: any, topic: TopicEnum) {
    // 유저의 상태에 관여된 모든 대상에게 전달
    const sendUser: User = await this.getUser(userId, {
      relatedOf: true,
      joinChannels: true,
    });
    if (!sendUser) throw new Error('send user not found');
    const followers = await this.getFollowers(sendUser);
    const joinedChannels = await this.getJoinedChannels(sendUser);
    if (followers.length === 0 && joinedChannels.length === 0) return;

    switch (topic) {
      case TopicEnum.USER:
        await this.userNotifyGateway.notifyToUsers(followers, event, data);
        await this.userNotifyGateway.notifyToJoinedChatChannels(joinedChannels, event, data);
        return;
      case TopicEnum.GAME:
        return;
    }
  }

  async notifyUser(userId: number, event: string, data: any, topic: TopicEnum, target: number) {
    const sendUser: User = await this.getUser(userId, {});
    const targetUser: User = await this.getUser(target, {});
    if (!sendUser) throw new Error('send user not found');
    if (!targetUser) throw new Error('target user not found');
    switch (topic) {
      case TopicEnum.USER:
        await this.userNotifyGateway.notifyToUser(target, event, data);
        return;
      case TopicEnum.GAME:
        return;
    }
  }

  async notifyFollowings(userId: number, event: string, data: any, topic: TopicEnum) {
    const sendUser: User = await this.getUser(userId, { relationships: true });
    if (!sendUser) throw new Error('send user not found');
    const followings: Array<number> = await this.getFollowings(sendUser);
    if (followings.length === 0) return;

    switch (topic) {
      case TopicEnum.USER:
        await this.userNotifyGateway.notifyToUsers(followings, event, data);
        return;
      case TopicEnum.GAME:
        return;
    }
  }

  async notifyFollowers(userId: number, event: string, data: any, topic: TopicEnum) {
    const sendUser: User = await this.getUser(userId, { relatedOf: true });
    if (!sendUser) throw new Error('send user not found');
    const followers: Array<number> = await this.getFollowers(sendUser);
    if (followers.length === 0) return;

    switch (topic) {
      case TopicEnum.USER:
        await this.userNotifyGateway.notifyToUsers(followers, event, data);
        return;
      case TopicEnum.GAME:
        return;
    }
  }

  async notifyJoinedChannels(userId: number, event: string, data: any, topic: TopicEnum) {
    const sendUser: User = await this.getUser(userId, { joinChannels: true });
    if (!sendUser) throw new Error('send user not found');
    const joinedChannels: Array<number> = await this.getJoinedChannels(sendUser);
    if (joinedChannels.length === 0) return;

    switch (topic) {
      case TopicEnum.USER:
        await this.userNotifyGateway.notifyToJoinedChatChannels(joinedChannels, event, data);
        return;
      case TopicEnum.GAME:
        return;
    }
  }

  async notifySpecificChannel(userId: number, event: string, data: any, topic: TopicEnum, target: number) {
    const sendUser: User = await this.getUser(userId, {});
    if (!sendUser) throw new Error('send user not found');
    const targetChannel: ChatChannel = await this.chatChannelRepository.findOne({ where: { channel_id: target } });
    if (!targetChannel) throw new Error('target channel not found');
    switch (topic) {
      case TopicEnum.USER:
        await this.userNotifyGateway.notifyToSpecificChatChannel(target, event, data);
        return;
      case TopicEnum.GAME:
        return;
    }
  }
}
