import { UserRole } from '@/types/chat';
import React from 'react';
import { createContext } from 'react';

interface ChatContextProps {
  // isAdmin: boolean;
  // setIsAdmin: (tf: boolean) => void;

  myRole: UserRole | null;
  setMyRole: (role: UserRole | null) => void;
  
  // userList: ChatUser[];
  // setUserList: (users: ChatUser[]) => void;

  muteList: Record<number, number>;
  // muteListRef: React.MutableRefObject<Record<number, number> | null>;
  setMuteList: (mutes: Record<number, number>) => void;

  banList: Record<number, number>;
  // banListRef: React.MutableRefObject<Record<number, number> | null>;
  setBanList: (bans: Record<number, number>) => void;
};

const ChatContext = createContext<ChatContextProps>({
  // isAdmin: false,
  // setIsAdmin: () => {},

  myRole: null,
  setMyRole: () => {},

  muteList: {},
  // muteListRef: { current: null },
  setMuteList: () => {},

  banList: {},
  // banListRef: { current: null },
  setBanList: () => {},
});

export default ChatContext;