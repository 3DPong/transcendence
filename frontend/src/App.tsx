
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LogInForm } from "@/components/Organism/Form/LoginForm";
import { SignInForm } from '@/components/Organism/Form/SigninForm';
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
import { userListData_t } from "@/types/user";
import { UserListDataDummy } from '@/dummy/data';

const router = createBrowserRouter([ 
    { // 홈화면 (로그인 후)
        path: "/",
        element: <L0Template organism={ <Controller/>} />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "profile",
                element: <L1Template organism={ <Profile /> }/> // 파라미터로 userId 넣어줄 것. 
            },
            {
                path: "friends",
                element: <L1Template organism={ <LocalUserList /> }/>,
                children: [
                    {
                        path: "add", // nested routes. => /friends/add
                        element: <L2Template organism={ <GlobalUserList /> } />,
                        children: [
                            {
                                path: ":userId", // Global User List에서 클릭시 L3 위치에서 프로필이 뜨도록.
                                element: <L3Template organism={ <Profile /* UserId */ /> } /> // 파라미터로 userId 넣어줄 것. 
                            }
                        ]
                    },
                    {
                        path: ":userId",
                        element: <L2Template organism={ <Profile /* UserId */ /> } /> // 파라미터로 userId 넣어줄 것. 
                    },
                ]
            },
            {
                path: "rooms",
                element: <L1Template organism={ <LocalChatList /> }/>,
                children: [
                    {
                        path: "create",
                        element: <L2Template organism={ <CreateChat /> } /> 
                    },
                    {
                        path: "add",
                        element: <L2Template organism={ <GlobalChatList /> } />
                    },
                    {
                        path: ":roomId",
                        element: <ChatTemplate organism={<ChatDetail />} />
                    },
                ]
            },
            {
                path: "settings", // settings
                element: <L1Template organism={<div>settings</div>}/>
            }
        ]
    },
    { // 로그인
        path: "/login",
        element: <LogInForm />,
        errorElement: <ErrorPage />
    },
    { // 회원 가입
        path: "/signin",
        element: <SignInForm />,
        errorElement: <ErrorPage />
    }, 
    { // Game Debug 화면
        path: "/game",
        element: <Game />,
        errorElement: <ErrorPage />
    }
]);

function App() {
    const [user, setUser] = useState<User>();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [friends, setFriends] = useArray<userListData_t>(UserListDataDummy);

    return (
        <div className="App">
            <header className="App-header">
                <GlobalContext.Provider value={{user, setUser, rooms, setRooms, friends, setFriends}}>
                    <RouterProvider router={ router } />
                </GlobalContext.Provider>
            </header>
        </div>
    );
}

export default App;