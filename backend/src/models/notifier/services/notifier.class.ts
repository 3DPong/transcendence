import { Injectable } from '@nestjs/common';
import { TopicEnum } from '../enums/topic.enum';
import { ChannelEnum } from '../enums/channel.enum';
import { NotifierService } from './notifier.service';

@Injectable()
export class Notifier {
  constructor(private readonly notifierService: NotifierService) {}

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
        return await this.notifierService.notifyAll(userId, event, data, topic);
      case ChannelEnum.USER:
        return await this.notifierService.notifyUser(userId, event, data, topic, target);
      case ChannelEnum.CHANNELS:
        return await this.notifierService.notifyJoinedChannels(userId, event, data, topic);
      case ChannelEnum.SPECIFIC_CHANNEL:
        return await this.notifierService.notifySpecificChannel(userId, event, data, topic, target);
      case ChannelEnum.FOLLOWINGS:
        return await this.notifierService.notifyFollowings(userId, event, data, topic);
      case ChannelEnum.FOLLOWERS:
        return await this.notifierService.notifyFollowers(userId, event, data, topic);
    }
  }
}
