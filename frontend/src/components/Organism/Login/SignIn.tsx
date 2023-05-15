/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SignIn.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/23 17:04:59 by minkyeki          #+#    #+#             */
/*   Updated: 2023/05/15 18:55:20 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect } from 'react';
import { Box, Icon, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Email } from '@mui/icons-material';
import { Button } from '@mui/material';
import LOGO_42 from '@/assets/42_logo.svg';
import { request42SignIn } from '@/api/login/signIn';
import {useSocket} from "@/context/SocketContext";
import {useAlert} from "@/context/AlertContext";
import {useNavigate} from "react-router";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey, green } from '@mui/material/colors';

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

export function SignIn() {
  const navigate = useNavigate();

  const handle42SignInClick = () => {
    (async () => {
      await request42SignIn(); // 이 과정을 거쳐 자동 JWT 토큰이 발급된.
    })(/* IIFE */);
  };

  const handleEmailSignInClick = () => {
    // route to email signin page
    navigate('/email');
  }

  return (
    <>
      <div className=" flex flex-col justify-center h-screen ">
        
        <ThemeProvider theme={theme}>
          <Box sx={{ margin: "auto" }}>
            <Stack spacing={2} sx={{ /*alignItems: "start", */width: "100%", flex: 1 }}>
              <Typography gutterBottom fontWeight={600} textAlign="center" variant="h2" component="div" color={grey[800]} margin={0}>
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
