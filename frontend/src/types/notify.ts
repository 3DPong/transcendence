export enum userStatus {
  ONLINE, // 0
  OFFLINE, // 1
}

export interface UserStatusNotifyData {
  user_id: number,
  nickname: string,
  profile_url: string,
  status: userStatus,
}