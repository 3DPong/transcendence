import { UserStatus } from "@chatscope/chat-ui-kit-react";

export interface User {
  userId: number;
  profile: string;
  nickname: string;
  status?: UserStatus;
};

export interface Message {
  userId: number;
  content: string;
  created_at: string;
};

export interface Room {
  channelId : number;
  thumbnail? : string;
  channelName : string;
  channelType : string;  // TODO : ENUM type임 
  owner: User;
}

export type ChatType = "protected" | "private" | "public";