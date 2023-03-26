export interface User {
  id: number;
  profile: string;
  nickname: string;
};

export interface ChatUser extends User {
  role : UserRole;
  status : UserStatus;
};

export interface Message {
  id : number;
  senderId : number;
  content : string;
  created_at : string;
};

export interface Channel {
  id : number;
  thumbnail? : string;
  title : string;
  type : ChannelType;
  owner : User;
};

export type UserRole = "owner" | "admin" | "user";
export type UserStatus = "online" | "offline" | "ingame" | "none";
export type ChannelType = "protected" | "private" | "public" | "dm";