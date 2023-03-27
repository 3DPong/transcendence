import { createContext } from 'react';
import { Channel, User } from '@/types/chat';
import { friendData_t } from '@/types/user';
import { UpdateFunctionOverload } from "@/utils/CustomHooks/useArray";
import * as API from "@/api/API";

interface GlobalContextProps {
// user id (Logged User)
    loggedUserId?: number | null;
    setLoggedUserId: (id: number | null) => void;
// chat list
    channels: Channel[];
    setChannels: UpdateFunctionOverload<Channel>;
// friend list
    friends: friendData_t[];
    setFriends: UpdateFunctionOverload<friendData_t>;
};

const GlobalContext = createContext<GlobalContextProps>({
// user id (Logged User)
    loggedUserId: 0,
    setLoggedUserId: () => {},
// chat list
    channels: [],
    setChannels: () => {},
// friend list
    friends: [],
    setFriends: () => {},
});

export default GlobalContext;