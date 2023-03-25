import { createContext } from 'react';
import { Room, User } from '@/types/chat';
import { friendData_t } from '@/types/user';
import { UpdateFunctionOverload } from "@/utils/CustomHooks/useArray";
import * as API from "@/api/API";

interface GlobalContextProps {
// user id (Logged User)
    loggedUserId?: number | null;
    setLoggedUserId: (id: number | null) => void;
// chat list
    user: User | undefined;
    setUser: (user: User) => void;
    rooms: Room[];
    setRooms: (rooms: Room[]) => void;
// friend list
    friends: friendData_t[];
    setFriends: UpdateFunctionOverload<friendData_t>;
};

const GlobalContext = createContext<GlobalContextProps>({
// user id (Logged User)
    loggedUserId: 0,
    setLoggedUserId: () => {},
// chat list
    user : undefined,
    setUser: () => {},
    rooms: [],
    setRooms: () => {},
// friend list
    friends: [],
    setFriends: () => {},
});

export default GlobalContext;