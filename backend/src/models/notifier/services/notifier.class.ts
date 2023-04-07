import { Injectable } from '@nestjs/common';
import { TopicEnum } from '../enums/topic.enum';
import { ChannelEnum } from '../enums/channel.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities';
import { FindOptionsRelations, Repository } from 'typeorm';
import { ChatChannel } from '../../chat/entities';
import { NotifierGateway } from '../notifier.gateway';
import { RelationStatus } from '../../../common/enums/relationStatus.enum';

@Injectable()
export class Notifier {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ChatChannel) private readonly chatChannelRepository: Repository<ChatChannel>,
    private readonly userNotifyGateway: NotifierGateway
  ) {}

  /**
   * 서버에서 메시지를 푸시할 때 사용합니다.
   *
   * @param userId : number  보내는 사람의 id (유저의 정보를 알리는 목적이 강하기 때문에 존재함)
   * @param event : string 소켓 이벤트 이름
   * @param data : any 보내고자 하는 데이터
   * @param topic : TopicEnum  GAME 미구현
   * @param channel : ChannelEnum
   * @param target : number channel 이 USER / SPECIFIC_CHANNEL  일 경우에는 대상의 id
   */
  async notify(userId: number, event: string, data: any, topic: TopicEnum, channel: ChannelEnum, target) {
    if ((channel === ChannelEnum.USER || channel === ChannelEnum.SPECIFIC_CHANNEL) && target <= 0) {
      throw new Error('target is required');
    }
    switch (channel) {
      case ChannelEnum.ALL:
        return await this.notifyAll(userId, event, data, topic);
      case ChannelEnum.USER:
        return await this.notifyUser(userId, event, data, topic, target);
      case ChannelEnum.CHANNELS:
        return await this.notifyJoinedChannels(userId, event, data, topic);
      case ChannelEnum.SPECIFIC_CHANNEL:
        return await this.notifySpecificChannel(userId, event, data, topic, target);
      case ChannelEnum.FOLLOWINGS:
        return await this.notifyFollowings(userId, event, data, topic);
      case ChannelEnum.FOLLOWERS:
        return await this.notifyFollowers(userId, event, data, topic);
    }
  }

  private async getUser(userId: number, relations: FindOptionsRelations<User>) {
    return await this.userRepository.findOne({
      where: { user_id: userId },
      relations: relations,
    });
  }

  private async getFollowers(user: User) {
    return user.relatedOf
      .filter((relationship) => relationship.status === RelationStatus.FRIEND)
      .map((relationship) => relationship.user_id);
  }
  private async getFollowings(user: User) {
    return user.relationships
      .filter((relationship) => relationship.status === RelationStatus.FRIEND)
      .map((relationship) => relationship.target_id);
  }

  private async getJoinedChannels(user: User) {
    return user.joinChannels.map((channel) => channel.channel_id);
  }

  private async notifyAll(userId: number, event: string, data: any, topic: TopicEnum) {
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

  private async notifyUser(userId: number, event: string, data: any, topic: TopicEnum, target: number) {
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

  private async notifyFollowings(userId: number, event: string, data: any, topic: TopicEnum) {
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

  private async notifyFollowers(userId: number, event: string, data: any, topic: TopicEnum) {
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

  private async notifyJoinedChannels(userId: number, event: string, data: any, topic: TopicEnum) {
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

  private async notifySpecificChannel(userId: number, event: string, data: any, topic: TopicEnum, target: number) {
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
