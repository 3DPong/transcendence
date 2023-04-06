import { ChatUser } from '@/types/chat';
import { createContext } from 'react';

interface ChatContextProps {
  isAdmin: boolean;
  setIsAdmin: (tf: boolean) => void;
  
  // userList: ChatUser[];
  // setUserList: (users: ChatUser[]) => void;

  muteList: number[];
  setMuteList: (mutes: number[]) => void;

  banList: ChatUser[];
  setBanList: (bans: ChatUser[]) => void;
};

const ChatContext = createContext<ChatContextProps>({
  isAdmin: false,
  setIsAdmin: () => {},
  // userList: [],
  // setUserList: () => {},
  muteList: [],
  setMuteList: () => {},
  banList: [],
  setBanList: () => {},
});

export default ChatContext;