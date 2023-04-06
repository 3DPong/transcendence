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

@Injectable()
export class UserStatusSocketService {
  private readonly logger = new Logger('NotifyGateway');
  private readonly redisClient: Redis;
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
    this.redisClient = this.redisService.getClient();
  }

  async connect(socket: Socket) {
    const { user_id } = socket.handshake.query;

    if (!user_id) {
      this.logger.warn(`Invalid user_id on connecting with [${socket.id}]`);
      socket.disconnect();
      return;
    }
    // update in db
    try {
      await this.userRepository.update(user_id, { status: UserStatusEnum.ONLINE });
    } catch (e) {
      this.logger.error(`${e}, disconnecting...`);
      socket.disconnect();
      return;
    }
    // update in redis
    const userSockets: string = await this.redisClient.get(user_id.toString());
    let jsonUserSockets: UserSocketsDto;
    if (userSockets) {
      jsonUserSockets = JSON.parse(userSockets);
      jsonUserSockets.notifySocket = socket.id;
      this.redisClient.set(user_id.toString(), JSON.stringify(jsonUserSockets));
    } else {
      jsonUserSockets = {
        notifySocket: socket.id,
        chatSocket: null,
      };
      this.redisClient.set(user_id.toString(), JSON.stringify(jsonUserSockets));
    }
    this.logger.log(`connect with socket id: ${socket.id}`);
    socket.emit('message', 'connected');
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
  }
}
