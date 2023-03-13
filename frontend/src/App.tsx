/*                                                        :::      ::::::::   */
/*   App.tsx                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/08 00:27:51 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/08 00:27:51 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LogInForm } from "@/components/Form/LoginForm";
import { SignInForm } from '@/components/Form/SigninForm';
import { ErrorPage } from '@/components/ErrorPage'

import Game from '@/components/Game/Game';

import L0Template from "@/components/L0Template";
import L1Template from "@/components/L1Template";
import L2Template from "@/components/L2Template";

import Controller from "@/components/Organism/Controller/Controller";
import LocalUserList from "@/components/Organism/LocalUserList/LocalUserList";
import GlobalUserList from "@/components/Organism/GlobalUserList/GlobalUserList";

const router = createBrowserRouter([ 
    { // 홈화면 (로그인 후)
        path: "/",
        element: <L0Template organism={ <Controller/>} />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "profile",
                element: <L1Template organism={ <div>profile</div> }/>
            },
            {
                path: "friends",
                element: <L1Template organism={ <LocalUserList /> }/>,
                children: [
                    {
                        path: "add", // nested routes. => /friends/add
                        element: <L2Template organism={ <GlobalUserList /> } />,
                    },
                    {
                        path: ":userId",
                        element: <L2Template organism={ <div>profile</div> } /> // 파라미터로 userId 넣어줄 것.
                    },
                ]
            },
            {
                path: "rooms", // /rooms
                element: <L1Template organism={<div>rooms</div>}/>
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

   return (
        <div className="App">
            <header className="App-header">
                <RouterProvider router={ router } />
            </header>
        </div>
    );
}

export default App;