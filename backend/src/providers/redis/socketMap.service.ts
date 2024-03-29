import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';

interface SocketMap {
  [key: string]: string;
}

@Injectable()
export class SocketMapService {
  private readonly redisClient;

  getUserSocketKey(userId): string {
    return `user:${userId}`;
  }

  getSocketUserKey(socketId): string {
    return `socket:${socketId}`;
  }

  constructor(private redisService: RedisService) {
    this.redisClient = this.redisService.getClient();
  }

  async getUserSockets(userId: number): Promise<SocketMap | null> {
    return await this.getSocketsFromUserId(userId);
  }

  async getSocketUser(socketId: string): Promise<string | null> {
    return await this.getUserIdFromSocketId(socketId);
  }

  async setUserSocket(userId: number, socketType: string, socketId: string) {
    await this.setSocketIdToUserId(userId, socketType, socketId);
    await this.setUserIdToSocketId(socketId, userId);
  }

  async deleteUserSocket(userId: number, socketType: string) {
    const socketId = await this.redisClient.hget(this.getUserSocketKey(userId), socketType);
    if (!socketId) return;
    await this.removeUserIdFromSocketId(socketId);
    await this.removeSocketIdFromUserId(userId, socketType);
  }

  /**
   * Set socketId to userId
   *
   * it will be set like this in redis:
   *
   * userId : {
   *   socketType: socketId
   * }
   * @param userId
   * @param socketType
   * @param socketId
   */
  private async setSocketIdToUserId(userId: number, socketType: string, socketId: string) {
    return await this.redisClient.hmset(this.getUserSocketKey(userId), socketType, socketId);
  }

  /**
   * returns { socketType: socketId, ... }
   * @param userId
   */
  private async getSocketsFromUserId(userId: number): Promise<SocketMap | null> {
    const result = await this.redisClient.hgetall(this.getUserSocketKey(userId));
    if (Object.keys(result).length === 0) return null;
    return result;
  }

  /**
   * Set socketId to userId
   * it will be set like this in redis:
   * `socketToUser:${socketId}` : `${userId}`
   * @param socketId
   * @param userId
   */
  private async setUserIdToSocketId(socketId: string, userId: number) {
    await this.redisClient.set(this.getSocketUserKey(socketId), userId);
  }

  /**
   * will return userId
   * @param socketId
   */
  private async getUserIdFromSocketId(socketId: string): Promise<string | null> {
    return await this.redisClient.get(this.getSocketUserKey(socketId));
  }

  private async removeSocketIdFromUserId(userId: number, socketType: string) {
    await this.redisClient.hdel(this.getUserSocketKey(userId), socketType);
  }

  private async removeUserIdFromSocketId(socketId: string) {
    await this.redisClient.del(this.getSocketUserKey(socketId));
  }
}
