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
import { JwtService } from '@nestjs/jwt';
import { TokenStatusEnum } from '../../../../common/enums/tokenStatusEnum';
import { SocketException } from '../../../../common/filters/socket/socket.filter';

/**
 * 현재 scale-out 되었을 때, 서버가 정상적으로 다운되지 않은 경우, 유저의 온라인 상태가 꼬일 수 있는 문제가 있음.
 */

@Injectable()
export class NotifySocketService {
  private readonly logger = new Logger('NotifySocketService');

  constructor(
    private readonly socketMapService: SocketMapService,
    private readonly notifier: Notifier,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async connect(socket: Socket): Promise<void> {
    const cookie = socket.handshake.headers.cookie;
    const token = cookie
      .split(';')
      .find((c) => c.trim().startsWith('Authentication='))
      .split('=')[1]
      .trim();
    // check token and user
    if (!token) {
      throw new SocketException('Unauthorized', 'token is required');
    }
    const decoded = this.jwtService.verify(token);
    if (!decoded || !decoded.user_id || decoded.status !== TokenStatusEnum.SUCCESS) {
      throw new SocketException('Unauthorized', 'token is invalid');
    }
    const { user_id } = decoded;
    socket.data.user = user_id.toString();
    if (await this.isOnline(user_id, socket.id)) {
      throw new SocketException('Conflict', 'already online');
    }

    // update in db
    await this.userRepository.update({ user_id: user_id }, { status: UserStatusEnum.ONLINE });
    // update socket information in redis and server sockets.
    await this.socketMapService.setUserSocket(user_id, 'notify', socket.id);
    // notify to user status that subscribed to this user
    const userUpdated: UserUpdateDto = await this.userRepository.findOne({
      where: { user_id: user_id },
      select: {
        user_id: true,
        nickname: true,
        profile_url: true,
        status: true,
      },
    });
    await this.notifier.notify(+user_id, 'user_status', userUpdated, TopicEnum.USER, ChannelEnum.ALL, 0);
    this.logger.log(`user ${user_id} connect with socket id: ${socket.id}`);
  }

  async disconnect(socket: Socket): Promise<void> {
    const user_id = socket.data.user;
    if (!user_id) throw new Error('user_id is required');
    if (await this.isOnline(user_id, socket.id)) {
      this.logger.log(`Duplicate user ${user_id} disconnect with socket id: ${socket.id}`);
      return;
    }

    // update in db
    await this.userRepository.update(user_id, { status: UserStatusEnum.OFFLINE });
    // delete socket information in redis
    await this.socketMapService.deleteUserSocket(user_id, 'notify');
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

  async isOnline(userId: number, socketId: string): Promise<boolean> {
    // check user is online in db and sockets
    const sockets = await this.socketMapService.getUserSockets(userId);
    // offline case
    if (!sockets || !sockets.notify) return false;
    // 동일 소켓 접속 케이스는 무시
    return sockets.notify !== socketId;
  }
}
