/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SignIn.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/23 17:04:59 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/24 15:38:32 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect } from 'react';
import { Icon } from '@mui/material';
import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import LOGO_42 from '@/assets/42_logo.svg';
import { requestSignIn } from '@/api/login/signIn';
import {useSocket} from "@/context/SocketContext";
import * as API from "@/api/API";
import {useAlert} from "@/context/AlertContext";
import {useNavigate} from "react-router";

function Icon42() {
  return (
    <Icon>
      <img alt={"42LOGO"} src={LOGO_42} className=" align-middle text-center h-full"></img>
    </Icon>
  );
}

export function SignIn() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {disconnectAll} = useSocket();
  const {handleAlert} = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await API.getMySettings();
      if (res) { // login session is alive. go back to '/' home.
        alert("User is already logged in. Going back to home page...");
        navigate('/');
      } else { // no login session. close every socket.
        disconnectAll(); // disconnect every socket.
      }
    })(/* IIFE */);
  }, []);

  const handleClick = () => {
    (async () => {
      setIsLoading(true); // loading
      await requestSignIn(); // 이 과정을 거쳐 자동 JWT 토큰이 발급된.
      setIsLoading(false); // load finished
    })(/* IIFE */);
  };

  return (
      <>
        <div className=" flex items-center justify-center h-screen">
          <LoadingButton
              onClick={handleClick}
              loading={isLoading}
              loadingPosition="start"
              startIcon={<Icon42 />}
              variant="contained"
          >
            SignIn
          </LoadingButton>
        </div>
      </>
  );
}
