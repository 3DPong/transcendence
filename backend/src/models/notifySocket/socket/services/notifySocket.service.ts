import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entities';
import { UserStatusEnum } from '../../../../common/enums';
import { WsException } from '@nestjs/websockets';
import { UserSocketsDto } from '../dto/userSockets.dto';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { Notifier } from '../../../notifier/services/notifier.class';
import { TopicEnum } from '../../../notifier/enums/topic.enum';
import { ChannelEnum } from '../../../notifier/enums/channel.enum';

@Injectable()
export class NotifySocketService {
  private readonly logger = new Logger('NotifyGateway');
  private readonly redisClient: Redis;
  constructor(
    private readonly redisService: RedisService,
    private readonly notifier: Notifier,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
    this.redisClient = this.redisService.getClient();
  }

  async connect(socket: Socket) {
    const { user_id } = socket.handshake.query;

    // check handshake is valid
    // 해당 부분에서 jwt validation 필요합니다.
    if (!user_id) {
      this.logger.warn(`Invalid user_id on connecting with [${socket.id}]`);
      socket.disconnect();
      return;
    }
    // update in db
    try {
      await this.userRepository.update({ user_id: +user_id }, { status: UserStatusEnum.ONLINE });
    } catch (e) {
      this.logger.error(`${e}, disconnecting...`);
      socket.disconnect();
      return;
    }

    // update socket information in redis
    const userSockets: string = await this.redisClient.get(user_id.toString());
    let jsonUserSockets: UserSocketsDto;
    if (userSockets) {
      jsonUserSockets = JSON.parse(userSockets);
      jsonUserSockets.socketId = socket.id;
      this.redisClient.set(user_id.toString(), JSON.stringify(jsonUserSockets));
    } else {
      jsonUserSockets = {
        socketId: socket.id,
      };
      this.redisClient.set(user_id.toString(), JSON.stringify(jsonUserSockets));
    }
    this.logger.log(`connect with socket id: ${socket.id}`);
    socket.emit('message', 'connected');

    // notify to user status that subscribed to this user
    const userUpdated: User = await this.userRepository.findOne({
      where: { user_id: +user_id },
      select: {
        user_id: true,
        nickname: true,
        profile_url: true,
        status: true,
      },
    });
    await this.notifier.notify(+user_id, 'user_status', userUpdated, TopicEnum.USER, ChannelEnum.ALL, 0);
  }

  async disconnect(socket: Socket) {
    const { user_id } = socket.handshake.query;
    if (!user_id) throw new WsException('user_id is required');
    // update in db
    try {
      await this.userRepository.update(user_id, { status: UserStatusEnum.OFFLINE });
    } catch (e) {
      this.logger.error(`${e} on ${socket.id}`);
      this.logger.log(`disconnect with socket id: ${socket.id}`);
      return;
    }
    // update in redis
    const userSockets: string = await this.redisClient.get(user_id.toString());
    if (userSockets) {
      this.redisClient.del(user_id.toString());
    } else {
      this.logger.error(`${socket.id} is not exist in Redis`);
    }
    this.logger.log(`disconnect with socket id: ${socket.id}`);
    // notify to user status that subscribed to this user
    const userUpdated: User = await this.userRepository.findOne({
      where: { user_id: +user_id },
      select: {
        user_id: true,
        nickname: true,
        profile_url: true,
        status: true,
      },
    });
    await this.notifier.notify(+user_id, 'user_status', userUpdated, TopicEnum.USER, ChannelEnum.ALL, 0);
  }
}
