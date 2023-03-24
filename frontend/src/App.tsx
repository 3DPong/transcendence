
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ErrorPage } from '@/components/ErrorPage'

import L0Template from "@/components/L0Template";
import L1Template from "@/components/L1Template";
import L2Template from "@/components/L2Template";
import L3Template from "@/components/L2Template";

import Game from '@/components/Organism/Game/Game';
import Controller from "@/components/Organism/Controller/Controller";
import Profile from "@/components/Organism/Profile/Profile";
import LocalUserList from "@/components/Organism/Friends/LocalUserList/LocalUserList";
import GlobalUserList from "@/components/Organism/Friends/GlobalUserList/GlobalUserList";
import LocalChatList from '@/components/Organism/Chat/LocalChatList';
import GlobalChatList from '@/components/Organism/Chat/GlobalChatList';
import CreateChat from '@/components/Organism/Chat/CreateChat';
import ChatDetail from '@/components/Organism/Chat/ChatDetail';
import ChatTemplate from '@/components/ChatTemplate';

import GlobalContext from '@/context/GlobalContext';
import useArray from '@/utils/CustomHooks/useArray';
import { Room, User } from '@/types/chat';
import { friendData_t } from './types/user';
import { UserFriendRelationsDummyData } from '@/dummy/data';
import { SignIn } from './components/Organism/Login/SignIn';
import { SignUp } from './components/Organism/Login/SignUp';
import { Setting } from './components/Organism/Setting/Setting';

const router = createBrowserRouter([ 
    // ----------------------------------------------------
    // 이 아래 경로는 Session이 부여된 상태에서만 접근 가능.
    // ----------------------------------------------------
    { // home. 버튼은 login 42 button 하나만 넣어주면 됨.
        path: "/signin",
        element: <SignIn />,
        errorElement: <ErrorPage />
    },
    { // 회원 가입 (프로필 설정)
        path: "/signup",
        element: <SignUp />,
        errorElement: <ErrorPage />
    }, 
    // ----------------------------------------------------
    // 이 아래 경로는 Session이 부여된 상태에서만 접근 가능.
    // ----------------------------------------------------
    { // Game Debug 화면
        path: "/game",
        element: <Game />,
        errorElement: <ErrorPage />
    },
    { // 홈화면 (로그인 후)
        path: "/",
        element: <L0Template organism={ <Controller /> }/>,
        // element: <L0Template organism={<div>test</div>}/>,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "profile",
                element: <L1Template organism={ <Profile /> }/>
            },
            {
                path: "friends",
                element: <L1Template organism={ <LocalUserList /> }/>,
                children: [
                    {
                        path: "add", // nested routes. => /friends/add
                        element: <L2Template organism={ <GlobalUserList /> }/>,
                        children: [
                            {
                                path: ":userId", // Global User List에서 클릭시 L3 위치에서 프로필이 뜨도록.
                                element: <L3Template organism={ <Profile /> }/>
                            },
                        ]
                    },
                    {
                        path: ":userId",
                        element: <L2Template organism={ <Profile /> }/> 
                    },
                ]
            },
            {
                path: "rooms",
                element: <L1Template organism={ <LocalChatList /> }/>,
                children: [
                    {
                        path: "create",
                        element: <L2Template organism={ <CreateChat /> }/> 
                    },
                    {
                        path: "add",
                        element: <L2Template organism={ <GlobalChatList /> }/>
                    },
                    {
                        path: ":roomId",
                        element: <ChatTemplate organism={ <ChatDetail /> }/>
                    },
                ]
            },
            {
                path: "settings", // settings
                element: <L1Template organism={ <Setting/> }/>
            }
        ]
    }, 
]);

function App() {

    // 근데 전역 이 부분 데이터는 로그인 후에만 필요한 데이터이다. 로그인 화정에서부터 세팅할 필요가 없음...
    // GLOBAL CONTEXTS
    // ---------------------------------------------------------------------------
    // Logged User Id (on Login) --> should we store this to Session Storage? Should we encripten this data?
    const [ loggedUserId, setLoggedUserId ] = useState<number>();
    // Chat Rooms
    const [ user, setUser ] = useState<User>();
    const [ rooms, setRooms ] = useState<Room[]>([]);
    // Friend List
    const [ friends, setFriends ] = useArray<friendData_t>();
    // ---------------------------------------------------------------------------

    return (
        <div className="App">
            <header className="App-header">
                
                <GlobalContext.Provider value={{ user, setUser, rooms, setRooms, friends, setFriends, loggedUserId, setLoggedUserId }}>
                    <RouterProvider router={ router } />
                </GlobalContext.Provider>
            </header>
        </div>
    );
}

export default App;