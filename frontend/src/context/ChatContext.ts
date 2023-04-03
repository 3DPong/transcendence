import { ChatUser } from '@/types/chat';
import { createContext } from 'react';

interface ChatContextProps {
  isAdmin: boolean;
  setIsAdmin: (tf: boolean) => void;
  
  muteList: number[];
  setMuteList: (mutes: number[]) => void;

  banList: ChatUser[];
  setBanList: (bans: ChatUser[]) => void;
};

const ChatContext = createContext<ChatContextProps>({
  isAdmin: false,
  setIsAdmin: () => {},
  muteList: [],
  setMuteList: () => {},
  banList: [],
  setBanList: () => {},
});

export default ChatContext;