import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ErrorPage } from "@/components/ErrorPage";

import L0Template from "@/components/L0Template";
import L1Template from "@/components/L1Template";
import L2Template from "@/components/L2Template";
import L3Template from "@/components/L2Template";

import Controller from "@/components/Organism/Controller/Controller";
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
import { ErrorProvider } from "@/context/ErrorContext";

const router = createBrowserRouter([
  // ----------------------------------------------------
  // 이 아래 경로는 Session이 부여된 상태에서만 접근 가능.
  // ----------------------------------------------------
  {
    // home. 버튼은 login 42 button 하나만 넣어주면 됨.
    path: "/signin",
    element: <SignIn />,
    errorElement: <ErrorPage />,
  },
  {
    // 회원 가입 (프로필 설정)
    path: "/signup",
    element: <SignUp />,
    errorElement: <ErrorPage />,
  },
  // ----------------------------------------------------
  // 이 아래 경로는 Session이 부여된 상태에서만 접근 가능.
  // ----------------------------------------------------
  {
    // 홈화면 (로그인 후)
    path: "/",
    element: <L0Template organism={<Controller />} />,
    errorElement: <ErrorPage />,
    children: [
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
          },
        ],
      },
    ],
  },
]);

// 이건 App 최상단 로직에 두기.
import Game from "@/components/Organism/Game/Game";

function App() {
  // 근데 전역 이 부분 데이터는 로그인 후에만 필요한 데이터이다. 로그인 화정에서부터 세팅할 필요가 없음...
  // GLOBAL CONTEXTS
  // ---------------------------------------------------------------------------
  // Chat Rooms
  const [channels, setChannels] = useArray<Channel>([]);
  // Friend List
  const [friends, setFriends] = useArray<friendData_t>();
  // logged userId
  const [loggedUserId, setLoggedUserId] = useState<number | null>();
  // ---------------------------------------------------------------------------

  return (
      <div>
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
        <Game />
      </div>
  );
}

export default App;
