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
  chatConnect: () => void;
  notifySocket: Socket | null;
  notifyConnect: () => void;
  disconnectAll: () => void;
}

const SocketContext = createContext<SocketContextProps>({
  gameSocket: null,
  gameConnect: () => {},
  chatSocket: null,
  chatConnect: () => {},
  notifySocket: null,
  notifyConnect: () => {},
  disconnectAll: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
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
      console.log('gameConnect()');
    }
  };

  useEffect(() => {
    return () => {
      if (gameSocket) {
        console.log("[DEV] game socket disconnecting...");
        gameSocket.disconnect();
      }
    };
  }, [gameSocket]);

  const [chatSocket, setChatSocket] = useState<Socket | null>(null);

  const chatConnect = () => {
    if (!chatSocket) {
      const newSocket = io(SOCKET_URL + '/chat', {
        path: '/api/socket.io',
        transports: ['websocket'],
      });
      setChatSocket(newSocket);
      console.log('chatConnect()');
    }
  };

  useEffect(() => {
    return () => {
      if (chatSocket) {
        chatSocket.disconnect();
      }
    };
  }, [chatSocket]);


  const [notifySocket, setNotifySocket] = useState<Socket | null>(null);
  const notifyConnect = () => {
    if (!notifySocket) {
      const newSocket = io(`${SOCKET_URL}/notify`, {
        path: '/api/socket.io',
        transports: ['websocket'],
      });
      setNotifySocket(newSocket);
      console.log('notifyConnect()');
    }
  };

  useEffect(() => {
    return () => {
      if (notifySocket) {
        console.log("[DEV] notify socket disconnecting...");
        notifySocket.disconnect();
      }
    };
  }, [notifySocket]);

  const disconnectAll = () => {
    console.log("[DEV] Closing currently active sockets...")
    if (gameSocket) {
      console.log("[DEV] game socket disconnecting...");
      gameSocket.disconnect();
      setGameSocket(null);
    }
    if (chatSocket) {
      console.log("[DEV] chat socket disconnecting...");
      chatSocket.disconnect();
      setChatSocket(null);
    }
    if (notifySocket) {
      console.log("[DEV] notify socket disconnecting...");
      notifySocket.disconnect();
      setNotifySocket(null);
    }
  }

  return (
    <SocketContext.Provider value={{ gameSocket, gameConnect, chatSocket, chatConnect, notifySocket, notifyConnect, disconnectAll }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom Hook
export function useSocket() {
  const { gameSocket, gameConnect, chatSocket, chatConnect, notifySocket, notifyConnect, disconnectAll } = React.useContext(SocketContext);
  return { gameSocket, gameConnect, chatSocket, chatConnect, notifySocket, notifyConnect, disconnectAll };
}
