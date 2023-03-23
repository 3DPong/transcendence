/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Signin.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/23 17:04:59 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/23 22:10:05 by minkyeki         ###   ########.fr       */
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
function Icon42() {
  return (
    // <Icon sx={{flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
    <Icon>
      <img src={LOGO_42} className=" align-middle text-center h-full"></img>
    </Icon>
  );
}

/** API 42
 * @link https://github.com/3DPong/transcendence/discussions/14
 * GET /auth/signin
 * POST /auth/signup
 */

// 로그인
// 200 success
const SIGNIN_REQUEST = "GET /auth/signin";
interface GET_SignInResponseFormat {
  status: "SUCCESS" | "SIGNUP_MODE" | "2FA"; // 2차 인증.
  user_id?: number; // SUCCESS일 경우에만 날라옴.
}


// ----------------------------
// 1. 2FA로 오면, 아 내가 2차인증을 해야 되는구나, 그럼 창에다가 서버가 준 QR코드를 화면에 보여줌.
// 2. 사용자가 번호를 입력하고 , 엔터 치면 POST로 날라가고, 그럼 다시 성준님이 검증 진행.
// 3. 이 결과가 이제 로그인 성공 여부. (여기서 200받았을 때 home으로 가기)

// ----------------------------
// 1. 일반 로그인 과정은 서버에서 강제 리다이렉트를 시켜주는 거기 때문에 프론트에서 신경쓸 부분은 아니다.
// 2. 이 결과가 이제 로그인 성공 여부. (여기서 200받았을 때 home으로 가기)


interface signInProps {}

export function SignIn() {
  const { loggedUserId, setLoggedUserId } = useContext(GlobalContext);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  const requestServerAuth = () => {
    return new Promise<GET_SignInResponseFormat>((resolve, reject) => {
      setTimeout(() => {


        // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.


        resolve({ status: "SUCCESS", user_id: 200 }); // on SUCCESS
      }, 2000);
    });
  }

  const navigate = useNavigate();

  // 42 API 로그인 --> 일단 클릭하면 바로 되도록 테스트.
  const handleClick = () => {

    (async () => {
      setIsLoading(true); // loading
      const response = await requestServerAuth();
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
