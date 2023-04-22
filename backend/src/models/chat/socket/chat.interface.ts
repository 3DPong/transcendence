import { ChannelType, ChannelUserRoles } from "../entities";

export interface User {
  userId: string;
  userName: string;
  socketId: string;
}

export interface Room {
  name: string;
  host: User;
  users: User[];
}

export interface Message {
  user: User;
  timeSent: Date;
  message: string;
  roomName: string;
}

export interface ChatUser {
  userId: number;
  userName: string;
  profile_url: string;
  role: ChannelUserRoles;
  deleted_at: null;
}

export interface Owner {
  user_id: number;
  nickname: string;
  profile_url: string;
}

export interface ChannelInterface {
  channel_id: number;
  name: string;
  type: ChannelType;
  owner: Owner;
}
