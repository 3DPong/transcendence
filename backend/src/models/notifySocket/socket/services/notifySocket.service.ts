import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entities';
import { UserStatusEnum } from '../../../../common/enums';
import { Notifier } from '../../../notifier/services/notifier.class';
import { TopicEnum } from '../../../notifier/enums/topic.enum';
import { ChannelEnum } from '../../../notifier/enums/channel.enum';
import { SocketMapService } from '../../../../providers/redis/socketMap.service';
import { UserUpdateDto } from '../../../../common/interfaces/userUpdate.dto';

@Injectable()
export class NotifySocketService {
  private readonly logger = new Logger('NotifySocketService');
  constructor(
    private readonly socketMapService: SocketMapService,
    private readonly notifier: Notifier,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async connect(socket: Socket) {
    const { user_id } = socket.handshake.query;
    if (!user_id) throw new Error('user_id is required');
    // 해당 부분에서 jwt validation 필요합니다.

    const userId: string = user_id.toString();
    socket.data.user = userId;
    // update in db
    await this.userRepository.update({ user_id: +userId }, { status: UserStatusEnum.ONLINE });
    // update socket information in redis
    await this.socketMapService.setUserSocket(+userId, 'notify', socket.id);
    // notify to user status that subscribed to this user
    const userUpdated: UserUpdateDto = await this.userRepository.findOne({
      where: { user_id: +user_id },
      select: {
        user_id: true,
        nickname: true,
        profile_url: true,
        status: true,
      },
    });
    await this.notifier.notify(+user_id, 'user_status', userUpdated, TopicEnum.USER, ChannelEnum.ALL, 0);
    await this.notifier.notify(+user_id, 'user_status', userUpdated, TopicEnum.USER, ChannelEnum.USER, 1);
    this.logger.log(`user ${user_id} connect with socket id: ${socket.id}`);
  }

  async disconnect(socket: Socket) {
    const user_id = socket.data.user;
    if (!user_id) throw new Error('user_id is required');
    const userId: string = user_id.toString();
    // update in db
    await this.userRepository.update(user_id, { status: UserStatusEnum.OFFLINE });
    // delete socket information in redis
    await this.socketMapService.deleteUserSocket(+userId, 'notify');
    // notify to user status that subscribed to this user
    const userUpdated: UserUpdateDto = await this.userRepository.findOne({
      where: { user_id: +user_id },
      select: {
        user_id: true,
        nickname: true,
        profile_url: true,
        status: true,
      },
    });
    await this.notifier.notify(+user_id, 'user_status', userUpdated, TopicEnum.USER, ChannelEnum.ALL, 0);
    this.logger.log(`user ${user_id} disconnect with socket id: ${socket.id}`);
  }
}
