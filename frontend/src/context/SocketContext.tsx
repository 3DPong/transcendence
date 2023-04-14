// https://socket.io/docs/v4/client-initialization/
// https://velog.io/@warmwhiten/%EB%A6%AC%EC%95%A1%ED%8A%B8%EC%97%90%EC%84%9C-socket.io-%EC%95%8C%EB%A7%9E%EA%B2%8C-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0

import React, { ReactNode, createContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/../config/backend';
import { useError } from '@/context/ErrorContext';

interface SocketContextProps {
  gameSocket: Socket | null;
  gameConnect: () => void;
  chatSocket: Socket | null;
  chatConnect: (props: ChatConnectProps) => void;
}

const SocketContext = createContext<SocketContextProps>({
  gameSocket: null,
  gameConnect: () => {},
  chatSocket: null,
  chatConnect: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
}

interface ChatConnectProps {
  userId: number; // 나중에 세션쿠키로 변경예정
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [gameSocket, setGameSocket] = useState<Socket | null>(null);

  const gameConnect = () => {
    if (!gameSocket) {
      const newSocket = io(`${SOCKET_URL}/game`, {
        path: '/api/socket.io',
        transports: ['websocket'],
      });
      setGameSocket(newSocket);
    }
    console.log('gameConnect()');
  };

  useEffect(() => {
    return () => {
      if (gameSocket) {
        gameSocket.disconnect();
      }
    };
  }, [gameSocket]);

  const [chatSocket, setChatSocket] = useState<Socket | null>(null);

  const chatConnect = ({ userId }: ChatConnectProps) => {
    if (!chatSocket) {
      const newSocket = io(SOCKET_URL + '/chat', {
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
    <SocketContext.Provider value={{ gameSocket, gameConnect, chatSocket, chatConnect }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom Hook
export function useSocket() {
  const { gameSocket, gameConnect, chatSocket, chatConnect } = React.useContext(SocketContext);

  return { gameSocket, gameConnect, chatSocket, chatConnect };
}
