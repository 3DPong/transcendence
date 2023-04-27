import { ChannelType, ChannelUserRoles, MessageType } from "../entities";

export interface ChatUserInterface {
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
  thumbnail_url: string;
  owner: Owner;
}

export interface messageInterface {
  message: string | null;
  type: MessageType;
  channel_id: number;
}

export interface toggleInterface {
  user_id: number;
  channel_id: number;
  end_at: Date | null;
}

export interface basicsInterface {
  user_id: number;
  channel_id: number;
}

export interface idInterface {
  channel_id: number;
}
