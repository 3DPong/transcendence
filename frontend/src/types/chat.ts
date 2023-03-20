export interface User {
  userId: number;
  profile: string;
  nickname: string;
  status?: UserStatus;
};

export interface Message {
  messageId: number;
  userId: number;
  content: string;
  created_at: string;
};

export interface Room {
  channelId : number;
  thumbnail? : string;
  channelName : string;
  channelType : ChatType;  // TODO : ENUM type임 
  owner: User;
}

export type UserStatus = "online" | "offline" | "ingame" | "none";
export type ChatType = "protected" | "private" | "public" | "dm";