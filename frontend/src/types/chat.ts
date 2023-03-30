export const defaultThumbnail = "https://t1.daumcdn.net/cfile/tistory/216C553953FC27C335";

export interface User {
  id: number;
  profile: string;
  nickname: string;
};

export interface ChatUser extends User {
  role : UserRole;
  status? : UserStatus;
  isMuted? : boolean;
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

export const defaultUser: User = {
  id: 0,
  profile: defaultThumbnail,
  nickname: "Loading...",
};

export const defaultChatUser: ChatUser = {
  id: defaultUser.id,
  profile: defaultUser.profile,
  nickname: defaultUser.nickname,
  role: "none",
  status: "none",
};

export const defaultChannel: Channel = {
  id: 0,
  thumbnail: defaultThumbnail,
  title: "Loading...",
  type: "none",
  owner: defaultUser,
};

export type UserRole = "owner" | "admin" | "user" | "none";
export type UserStatus = "online" | "offline" | "ingame" | "none";
export type ChannelType = "protected" | "private" | "public" | "dm" | "none";