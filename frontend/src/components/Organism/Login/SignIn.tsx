/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SignIn.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/23 17:04:59 by minkyeki          #+#    #+#             */
/*   Updated: 2023/05/16 16:42:16 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect } from 'react';
import { Box, Icon, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Email } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Divider } from '@mui/material';

import * as API from "@/api/API";
import LOGO_42 from '@/assets/42_logo.svg';
import LOGO_NAVER from '@/assets/Naver.png';
import LOGO_KAKAO from '@/assets/KakaoTalk.svg';
import LOGO_GOOGLE from '@/assets/Google.svg';

import {useSocket} from "@/context/SocketContext";
import {useAlert} from "@/context/AlertContext";
import {useNavigate} from "react-router";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey, green } from '@mui/material/colors';
import GoogleIcon from '@mui/icons-material/Google';

const theme = createTheme({
  palette: {
    primary: {
      main: grey[100],
      contrastText: grey[800],
    },
    secondary: {
      main: grey[800],
      contrastText: '#fff',
    }
  },
});

function Icon42() {
  return (
    <Icon>
      <img alt={"42LOGO"} src={LOGO_42} className=" align-middle text-center h-full"></img>
    </Icon>
  );
}

function IconKakao() {
  return (
    <Icon>
      <img alt={"LOGO_KAKAO"} src={LOGO_KAKAO} className=" align-middle text-center h-full"></img>
    </Icon>
  );
}

function IconGoogle() {
  return (
    <Icon>
      <img alt={"LOGO_GOOGLE"} src={LOGO_GOOGLE} className=" align-middle text-center h-full"></img>
    </Icon>
  );
}

function IconNaver() {
  return (
    <Icon>
      <img alt={"LOGO_NAVER"} src={LOGO_NAVER} className=" align-middle text-center h-full"></img>
    </Icon>
  );
}

export function SignIn() {
  const navigate = useNavigate();

  const handle42SignInClick = () => {
    (async () => {
      await API.request42SignIn(); // 이 과정을 거쳐 자동 JWT 토큰이 발급된.
    })(/* IIFE */);
  };

  const handleEmailSignInClick = () => {
    // route to email signin page
    navigate('/email');
  }

  const handleKakaoSignInClick = () => {
    (async () => {
      await API.requestKakaoSignIn(); // 이 과정을 거쳐 자동 JWT 토큰이 발급된.
    })(/* IIFE */);
  }

  const handleNaverSignInClick = () => {
    (async () => {
      await API.requestNaverSignIn(); // 이 과정을 거쳐 자동 JWT 토큰이 발급된.
    })(/* IIFE */);
  }

  const handleGoogleSignInClick = () => {
    (async () => {
      await API.requestGoogleSignIn(); // 이 과정을 거쳐 자동 JWT 토큰이 발급된.
    })(/* IIFE */);
  }

  return (
    <>
      <div className=" flex flex-col justify-center h-screen ">
        
        <ThemeProvider theme={theme}>
          <Box sx={{ margin: "auto" }}>
            <Stack spacing={2} sx={{ /*alignItems: "start", */width: "100%", flex: 1 }}>
              <Typography gutterBottom fontWeight={600} textAlign="center" variant="h2" color={grey[800]} component="div" margin={0}>
                {"Sign In"}
              </Typography>
              <Button
                size='large'
                onClick={handle42SignInClick}
                startIcon={<Icon42 />}
                variant="contained"
                color='secondary'
                sx={{ justifyContent: "start", textTransform: "none" }}
              >
                Continue with 42Intra
              </Button>

              <Button
                size='large'
                onClick={handleKakaoSignInClick}
                startIcon={<IconKakao />}
                variant="contained"
                color='primary'
                sx={{ justifyContent: "start", textTransform: "none" }}
              >
                Continue with Kakao
              </Button>

              <Button
                size='large'
                onClick={handleNaverSignInClick}
                startIcon={<IconNaver />}
                variant="contained"
                color='primary'
                sx={{ justifyContent: "start", textTransform: "none" }}
              >
                Continue with Naver
              </Button>

              <Button
                size='large'
                onClick={handleGoogleSignInClick}
                startIcon={<IconGoogle />}
                variant="contained"
                color='primary'
                sx={{ justifyContent: "start", textTransform: "none" }}
              >
                Continue with Google
              </Button>

              <Divider sx={{ bgcolor: "secondary.light" }} />

              <Button
                size='large'
                onClick={handleEmailSignInClick}
                startIcon={<Email />}
                variant="contained"
                color='primary'
                sx={{ justifyContent: "start", textTransform: "none" }}
              >
                Continue with Email
              </Button>
            </Stack>
          </Box>
        </ThemeProvider>
      </div>
    </>
  );
}
