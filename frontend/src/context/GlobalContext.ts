import { createContext } from 'react';
import { Room, User } from '@/types/chat';
import { userListData_t } from '@/types/user';
import { UpdateFunctionOverload } from "@/utils/CustomHooks/useArray";

interface GlobalContextProps {
// chat list
    user: User | undefined;
    setUser: (user: User) => void;
    rooms: Room[];
    setRooms: (rooms: Room[]) => void;
// friend list
    friends: userListData_t[];
    setFriends: UpdateFunctionOverload<userListData_t>;
};

const GlobalContext = createContext<GlobalContextProps>({
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