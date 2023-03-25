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

import GlobalContext from "@/context/GlobalContext";
import { useContext, useEffect, useInsertionEffect, useLayoutEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { Button, Icon } from "@mui/material";

import { useState } from "react";
import { SvgIcon } from "@mui/material";
import { Box } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

import LOGO_42 from "@/assets/42_logo.svg";
import { Assert } from "@/utils/Assert";
import { requestSignIn } from "@/api/login/signIn";

function Icon42() {
  return (
    // <Icon sx={{flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
    <Icon>
      <img src={LOGO_42} className=" align-middle text-center h-full"></img>
    </Icon>
  );
}

interface signInProps {}

export function SignIn() {
  const { loggedUserId, setLoggedUserId } = useContext(GlobalContext);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  const navigate = useNavigate();

  // 42 API 로그인 --> 일단 클릭하면 바로 되도록 테스트.
  const handleClick = () => {

    // setLoggedUserId(null); // 먼저 State 초기화부터 진행.
    sessionStorage.clear(); // 이 버튼이 클릭된 경우는 로그인을 처음 하는 경우 뿐임.
    // 만약 이미 로그인을 했거나 데이터가 존재하면 이 페이지에서 바로 리다이렉트 되기 때문.


    (async () => {
      setIsLoading(true); // loading
      const response = await requestSignIn();
      setIsLoading(false); // load finished

      if (response.status === "SUCCESS") 
      { // go to '/home'
        console.log("Login Success");
        Assert.NonNullish(response.user_id, "서버에서 null 들어옴");
        setLoggedUserId(response.user_id);
      } 
      else
      { // go to SignUp
        console.log("Go to SignUp page");
        navigate("/signup");
      }
    })(/* IIFE */);
  };

  // check if user is already logged-in on first render
  useEffect(() => {
    // loggedUserId가 있고 세션스토리지도 있다는 얘기는 앱 로그인 후 사용자가 /signin 경로를 입력한 경우이다.
    // 이 경우는 암것도 하지 않고 home으로 리다이렉트만 시킨다.
    if (sessionStorage.getItem("user_id") !== null) {
      navigate("/"); // home 경로로 이동한다.
      return ;
    }
  }, [])

  // save loggedUserId state to Session Storage
  useEffect(() => {
    if (loggedUserId && sessionStorage.getItem("user_id") === null) {
        // 세션스토리지에 데이터가 없다면, 그건 이전에 로그인을 한 적이 없다는 얘기.
        alert("[DEV] Login Success. state {loggedUserId} is set");
        // 이 경우 브라우저 세션 스토리지에 해당 id를 저장한다. 이 데이터는 페이지 re-refresh 이후 App.tsx 에서 reload된다.
        sessionStorage.setItem("user_id", loggedUserId.toString());
        navigate("/"); // home 경로로 이동한다.
        return ;
      }
  }, [loggedUserId]);

  // navigate 함수 사용시 컴포넌트 깜빡임 문제 해결을 위한 시도.
  if (sessionStorage.getItem("user_id") !== null) 
    return <></>;
  else
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