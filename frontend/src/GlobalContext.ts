import { createContext } from 'react';
import { Room, User } from '@/types/chat';

interface GlobalContextProps {
    user: User | undefined;
    setUser: (user: User) => void;
    rooms: Room[];
    setRooms: (rooms: Room[]) => void;
    friends: User[];
    setFriends: (users: User[]) => void;
};

const GlobalContext = createContext<GlobalContextProps>({
    user : undefined,
    setUser: () => {},
    rooms: [],
    setRooms: () => {},
    friends: [],
    setFriends: () => {},
});

export default GlobalContext;