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

@Injectable()
export class NotifySocketService {
  private readonly logger = new Logger('NotifySocketService');
  constructor(
    private readonly socketMapService: SocketMapService,
    private readonly notifier: Notifier,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async connect(socket: Socket) {
    const cookie = socket.handshake.headers.cookie;
    const token = cookie
      .split(';')
      .find((c) => c.trim().startsWith('Authentication='))
      .split('=')[1]
      .trim();
    if (!token) throw new Error('token is required');
    const decoded = this.jwtService.verify(token);
    if (!decoded || !decoded.user_id || decoded.status !== TokenStatusEnum.SUCCESS) throw new Error('token is invalid');
    const { user_id } = decoded;

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
