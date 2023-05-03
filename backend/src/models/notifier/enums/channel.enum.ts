export enum ChannelEnum {
  ALL, // 사용자의 친구 & 참여중인 채팅방에게 전송
  USER, // 특정 사용자에게 전송
  FOLLOWINGS, // 사용자의 친구에게 전송
  FOLLOWERS, // 사용자를 친구로 등록한 유저들에게 전송
  CHANNELS, // 사용자가 참여중인 모든 채팅방에게 전송
  SPECIFIC_CHANNEL, // 특정 채팅방에게 전송
}
