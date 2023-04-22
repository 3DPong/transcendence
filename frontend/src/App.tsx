import React, {  useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ErrorPage } from "@/components/ErrorPage";

import L0Template from "@/components/L0Template";
import L1Template from "@/components/L1Template";
import L2Template from "@/components/L2Template";
import L3Template from "@/components/L2Template";

import Controller from "@/components/Organism/Home/Controller/Controller";
import Profile from "@/components/Organism/Profile/Profile";
import LocalUserList from "@/components/Organism/Friends/LocalUserList/LocalUserList";
import GlobalUserList from "@/components/Organism/Friends/GlobalUserList/GlobalUserList";
import LocalChatList from "@/components/Organism/Chat/LocalChatList";
import GlobalChatList from "@/components/Organism/Chat/GlobalChatList";
import CreateChat from "@/components/Organism/Chat/CreateChat";
import ChatDetail from "@/components/Organism/Chat/ChatDetail";
import ChatTemplate from "@/components/ChatTemplate";

import GlobalContext from "@/context/GlobalContext";
import useArray from "@/utils/CustomHooks/useArray";
import { Channel } from "@/types/chat";
import { friendData_t } from "./types/user";
import { SignIn } from "./components/Organism/Login/SignIn";
import { SignUp } from "./components/Organism/Login/SignUp";
import { Auth2FaInput } from "./components/Organism/Login/2FA";
import { ErrorProvider } from "@/context/ErrorContext";
import AlertSnackbar from "@/components/Molecule/AlertSnackbar";
import Game from "@/components/Organism/Game/Game";
import {SocketProvider} from "@/context/SocketContext";
import {Home} from "@/components/Organism/Home/Home";
import Renderer3D from "@/components/Organism/Game/Renderer/Renderer";
import { GameTest } from "@/components/Test/GameTest";
import ChatProfileTemplate from "./components/ChatProfileTemplate";



const router = createBrowserRouter([
  // ----------------------------------------------------
  // 이 아래 경로는 Session이 부여된 상태에서만 접근 가능.
  // ----------------------------------------------------
  {
    // home. 버튼은 login 42 button 하나만 넣어주면 됨.
    path: "/signin",
    element:
        <div>
          <SignIn />
          <AlertSnackbar />
        </div>,
    errorElement: <ErrorPage />,
  },
  {
    // 회원 가입 (프로필 설정)
    path: "/signup",
    element:
        <div>
          <SignUp />
          <AlertSnackbar />
        </div>,
    errorElement: <ErrorPage />,
  },
  {
    // 회원 가입 (프로필 설정)
    path: "/2fa",
    element:
        <div>
          <Auth2FaInput />
          <AlertSnackbar />
        </div>,
    errorElement: <ErrorPage />,
  },
  // ----------------------------------------------------
  // 이 아래 경로는 Session이 부여된 상태에서만 접근 가능.
  // ----------------------------------------------------
  {
    // 홈화면 (로그인 후)
    path: "/",
    element: (
      <div>
        <L0Template organism={
          <>
            <Controller />
            <Home />
          </>
        } />
        <AlertSnackbar />
      </div>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "game",
        element: <Game />
      },
      {
        path: "profile",
        element: <L1Template organism={<Profile />} />,
      },
      {
        path: "friends",
        element: <L1Template organism={<LocalUserList />} />,
        children: [
          {
            path: "add", // nested routes. => /friends/add
            element: <L2Template organism={<GlobalUserList />} />,
            children: [
              {
                path: ":userId", // Global User List에서 클릭시 L3 위치에서 프로필이 뜨도록.
                element: <L3Template organism={<Profile />} />,
              },
            ],
          },
          {
            path: ":userId",
            element: <L2Template organism={<Profile />} />,
          },
        ],
      },
      {
        path: "channels",
        element: <L1Template organism={<LocalChatList />} />,
        children: [
          {
            path: "create",
            element: <L2Template organism={<CreateChat />} />,
          },
          {
            path: "add",
            element: <L2Template organism={<GlobalChatList />} />,
          },
          {
            path: ":channelId",
            element: <ChatTemplate organism={<ChatDetail />} />,
            children: [
              {
                path: "profile/:userId",
                element: <ChatProfileTemplate organism={<Profile />} />,
              },
            ],
          },
        ],
      },
    ],
  },
]);


function App() {
  // GLOBAL CONTEXTS
  // ---------------------------------------------------------------------------
  // Chat Rooms
  const [channels, setChannels] = useArray<Channel>([]);
  // Friend List
  const [friends, setFriends] = useArray<friendData_t>();
  // logged userId
  const [loggedUserId, setLoggedUserId] = useState<number | null>();
  // ---------------------------------------------------------------------------

  useEffect(() => {
    console.log("[DEV] App re-render");
  }, []);


  return (
    <div>
      <SocketProvider>
        <ErrorProvider>
          <div className="App">
            <header className="App-header">
              <GlobalContext.Provider
                value={{ channels, setChannels, friends, setFriends, loggedUserId, setLoggedUserId }}
              >
                <RouterProvider router={router} />
              </GlobalContext.Provider>
            </header>
          </div>
        </ErrorProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
