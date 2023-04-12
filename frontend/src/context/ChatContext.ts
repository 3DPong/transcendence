import { createContext } from 'react';

interface ChatContextProps {
  isAdmin: boolean;
  setIsAdmin: (tf: boolean) => void;
  
  // userList: ChatUser[];
  // setUserList: (users: ChatUser[]) => void;

  muteList: Record<number, number>;
  setMuteList: (mutes: Record<number, number>) => void;

  banList: Record<number, number>;
  setBanList: (bans: Record<number, number>) => void;
};

const ChatContext = createContext<ChatContextProps>({
  isAdmin: false,
  setIsAdmin: () => {},
  // userList: [],
  // setUserList: () => {},
  muteList: {},
  setMuteList: () => {},
  banList: {},
  setBanList: () => {},
});

export default ChatContext;