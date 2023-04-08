import { SOCK_URL } from '@/../config/backend';
import React, { ReactNode, createContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextProps {
  chatSocket: Socket | null;
  chatConnect: (props: ChatConnectProps) => void;
};

const SocketContext = createContext<SocketContextProps>({
  chatSocket: null,
  chatConnect: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
};

interface ChatConnectProps {
  userId: number; // 나중에 세션쿠키로 변경예정
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);

  const chatConnect = ({ userId }: ChatConnectProps) => {
    if (!chatSocket) {
      const newSocket = io(SOCK_URL, {
        //path: '/chat_socket',
        query: {
          user_id: userId,
        },
      });
      setChatSocket(newSocket);
    }
  };

  useEffect(() => {
    return () => {
      if (chatSocket) {
        chatSocket.disconnect();
      }
    };
  }, [chatSocket]);

  return (
    <SocketContext.Provider value={{ chatSocket, chatConnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const { chatSocket, chatConnect } = React.useContext(SocketContext);
  return { chatSocket, chatConnect };
};