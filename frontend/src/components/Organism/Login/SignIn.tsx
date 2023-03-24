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
import { useContext, useEffect } from "react";
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

    (async () => {
      setIsLoading(true); // loading
      const response = await requestSignIn();
      setIsLoading(false); // load finished

      if (response.status === "SUCCESS") 
      { // go to '/home'
        console.log("Login Success !!!");
        Assert.NonNullish(response.user_id, "서버에서 null 들어옴");
        setLoggedUserId(response.user_id);
      } 
      else 
      { // go to SignUp
        console.log("Go to SignUp page...");
        navigate("/signup");
      }
    })(/* IIFE */);
  };

  // run if logged User id is set.
  useEffect(() => {
    if (loggedUserId) {
      navigate("/");
    }
  }, [loggedUserId]);

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
