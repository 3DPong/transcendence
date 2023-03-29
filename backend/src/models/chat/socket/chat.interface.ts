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


export interface ServerToClientEvents {
  chat: (e: Message) => void;
}

export interface ClientToServerEvents {
  chat: (e: Message) => void;
  enter_room: (e: { user: User; roomName: string }) => void;
}