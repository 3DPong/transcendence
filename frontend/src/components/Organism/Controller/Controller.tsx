/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Controller.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/12 23:04:13 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/24 16:36:22 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemButtonLink from "@/components/Molecule/Link/ListItemButtonLink";
import { AccountBox, Group, Chat, Settings } from "@mui/icons-material";
import GlobalContext from "@/context/GlobalContext";
import { useNavigate, useLocation } from "react-router";
import * as API from "@/api/API";
import { Assert } from "@/utils/Assert";
import { Alert } from "@mui/material";

import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

interface welcomeDialogProps {
    state: { nickname: string };
}

function WelcomeDialog({state}: welcomeDialogProps) {

    const [open, setOpen] = useState<boolean>(false);

    const handleClickOpen = () => {
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
      };

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">welcome {state.nickname}!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            저희 게임에 처음 오셨군요! <br/>
            게임 진행에 관한 튜토리얼을 진행하시겠어요?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>네</Button>
          <Button onClick={handleClose} autoFocus>아니요</Button>
        </DialogActions>
      </Dialog>
    );
}


export enum eClickedBtn {
    NONE,
    PROFILE,
    FRIENDS,
    ROOMS,
    SETTINGS,
}

export default function Controller() {

    const [ clickState, setClickState ] = React.useState<eClickedBtn>(0);
    const { loggedUserId } = React.useContext(GlobalContext);

    // ---------------------------------------------------------------
    // 첫 렌더시에 userId가 세팅이 되어 있는지 검증! 여기서 userID가 세팅이 안되면 강제 signin 리다이렉트로 감.
    // 어떻게 생각하면 강제 로그인 검사임 (프론트 차원)
    const location = useLocation();

    const navigate = useNavigate();
    React.useEffect(() => {

        // 이  방식 보다는, API call로 session을 서버가 검증하도록 요청하자.
        if (!loggedUserId) { // 로그인 유저 데이터가 없다면 login page로 이동.
            <Alert severity="info">no login info. redirecting to signin page...</Alert>
            navigate("/signin");
            return;
        }


        Assert.NonNullish(loggedUserId);
        (async () => {
            // 400 Bad request : 대부분 dto. API call이 잘못된 거임.
            // 401은 무조건 세션비전상.
            // 409는 로그인 후 다른 창에서 또 접속할 경우 --> 내가 "이미 접속된 유저입니다." 라고 띄워줘야함
        })(/* IIFE */);

    }, []);
    // ---------------------------------------------------------------

    const toggleClickState = (srcState: eClickedBtn) => {
        setClickState( (clickState !== srcState) ? srcState : eClickedBtn.NONE);
    }

    const BUTTON_STYLE = ""

    return (
        // <Box sx={{ display: "flex" }}>

        <>
        {/* { s && <WelcomeDialog state={s}/>} */}
        <Box>
            <CssBaseline />
            <Drawer
                sx={{
                    width: "fit-content",
                    // flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: "fit-content",
                        boxSizing: "border-box",
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar />
                <Divider />
                <List sx={{padding:0, margin:0}}>
                    <div className={BUTTON_STYLE}>
                        <ListItemButtonLink
                            to={ (clickState !== eClickedBtn.PROFILE) ? "./profile" : "/home"}
                            tooltipTitle="Profile"
                            children={<AccountBox fontSize="large" />}
                            onClick={() => toggleClickState(eClickedBtn.PROFILE)}
                            badge={0} /** @special 친구 업데이트 등의 이벤트 발생시 여기에 추가. */
                        />
                    </div>
                    <div className={BUTTON_STYLE}>
                        <ListItemButtonLink
                            to={ (clickState !== eClickedBtn.FRIENDS) ? "./friends" : "/home"}
                            tooltipTitle="Friends"
                            children={<Group fontSize="large" />}
                            onClick={() => toggleClickState(eClickedBtn.FRIENDS)}
                            badge={3} /** @special 친구 업데이트 등의 이벤트 발생시 여기에 추가. */
                        />
                    </div>
                    <div className={BUTTON_STYLE}>
                        <ListItemButtonLink
                            to={ (clickState !== eClickedBtn.ROOMS) ? "./rooms" : "/home"}
                            tooltipTitle="Rooms"
                            children={<Chat fontSize="large" />}
                            onClick={() => toggleClickState(eClickedBtn.ROOMS)}
                            badge={5} /** @special 친구 업데이트 등의 이벤트 발생시 여기에 추가. */
                        />
                    </div>
                    <div className={BUTTON_STYLE}>
                        <ListItemButtonLink
                            to={ (clickState !== eClickedBtn.SETTINGS) ? "./settings" : "/home"}
                            tooltipTitle="Settings"
                            children={<Settings fontSize="large" />}
                            onClick={() => toggleClickState(eClickedBtn.SETTINGS)}
                            badge={0} /** @special 친구 업데이트 등의 이벤트 발생시 여기에 추가. */
                        />
                    </div>
                </List>
            </Drawer>
        </Box>
        </>
    );
}
