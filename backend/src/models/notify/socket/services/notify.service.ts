import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RedisService } from 'nestjs-redis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entities';
import { UserStatusEnum } from '../../../../common/enums';
import { WsException } from '@nestjs/websockets';
import { UserSocketsDto } from '../dto/userSockets.dto';

@Injectable()
export class NotifyService {
  logger = new Logger('NotifyGateway');
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}
  async connect(socket: Socket) {
    const redisClient = this.redisService.getClient();
    const { user_id } = socket.handshake.query;
    // update in db
    try {
      await this.userRepository.update(user_id, { status: UserStatusEnum.ONLINE });
    } catch (e) {
      this.logger.error(e);
      throw new WsException('update user status error');
    }
    // update in redis
    const userSockets: string = await redisClient.get(user_id.toString());
    let jsonUserSockets: UserSocketsDto;
    if (userSockets) {
      jsonUserSockets = JSON.parse(userSockets);
      jsonUserSockets.notifySocket = socket.id;
      redisClient.set(user_id.toString(), JSON.stringify(jsonUserSockets));
    } else {
      jsonUserSockets = {
        notifySocket: socket.id,
        chatSocket: null,
      };
      redisClient.set(user_id.toString(), JSON.stringify(jsonUserSockets));
    }
    this.logger.log(`connect with socket id: ${socket.id}`);
  }

  async disconnect(socket: Socket) {
    const redisClient = this.redisService.getClient();
    const { user_id } = socket.handshake.query;
    // update in db
    try {
      await this.userRepository.update(user_id, { status: UserStatusEnum.OFFLINE });
    } catch (e) {
      this.logger.error(e);
      throw new WsException('update user status error');
    }
    // update in redis
    const userSockets: string = await redisClient.get(user_id.toString());
    if (userSockets) {
      redisClient.del(user_id.toString());
    }
    this.logger.log(`disconnect with socket id: ${socket.id}`);
  }
}
