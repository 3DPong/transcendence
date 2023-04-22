/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Controller.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/12 23:04:13 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/31 17:31:39 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemButtonLink from '@/components/Molecule/Link/ListItemButtonLink';
import { AccountBox, Group, Chat, Settings } from '@mui/icons-material';
import GamesIcon from '@mui/icons-material/Games';
import { SxProps } from '@mui/material';
import SettingDialog from '@/components/Organism/Setting/SettingDialog';
import {useContext, useEffect} from "react";
import GlobalContext from "@/context/GlobalContext";
import {useSocket} from "@/context/SocketContext";

export enum eClickedBtn {
  NONE,
  GAME,
  PROFILE,
  FRIENDS,
  ROOMS,
}

export default function Controller() {
  const [clickState, setClickState] = React.useState<eClickedBtn>(0);
  const [openSetting, setOpenSetting] = React.useState<boolean>(false);
  const {loggedUserId} = useContext(GlobalContext);
  const {notifyConnect} = useSocket();

  // ---------------------------------------------------------------
  // 첫 렌더시에 userId가 세팅이 되어 있는지 검증! 여기서 userID가 세팅이 안되면 강제 signin 리다이렉트로 감.
  // 어떻게 생각하면 강제 로그인 검사임 (프론트 차원)
  React.useEffect(() => {
    console.log("Initial Render : Controller.tsx");
    setClickState(eClickedBtn.NONE);
  }, []);
  // ---------------------------------------------------------------

  const toggleClickState = (srcState: eClickedBtn) => {
    setClickState((prev) => {
      console.log(`[Controller] state ${prev} --> ${srcState}`)
      if (srcState === eClickedBtn.GAME) {
        return srcState;
      }
      return ((prev !== srcState) ? srcState : eClickedBtn.NONE);
    });
  };

  const BUTTON_STYLE = '';
  const sx: SxProps = { width: '100%', aspectRatio: '1/1', border: 0.5, borderColor: 'gray' };

  // Connect notify socket
  useEffect(() => {
    if (!loggedUserId) return;
    console.log("[DEV] Connecting Notify Socket... at [Controller.tsx]");
    notifyConnect();
  }, [loggedUserId]);

  return (
    <>
      <Box>
        <CssBaseline />
        <Drawer
          sx={{
            width: 'fit-content',
            // flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 'fit-content',
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar />
          <Divider />
          <List sx={{ padding: 0, margin: 0 }}>
            <div className={BUTTON_STYLE}>
              <ListItemButtonLink
                  sx={sx}
                  to={clickState !== eClickedBtn.GAME ? './game' : '/'}
                  tooltipTitle="Random Match"
                  children={<GamesIcon fontSize="large" />}
                  onClick={() => toggleClickState(eClickedBtn.GAME)}
              />
            </div>
            <div className={BUTTON_STYLE}>
              <ListItemButtonLink
                sx={sx}
                to={clickState !== eClickedBtn.PROFILE ? './profile' : '/'}
                tooltipTitle="Profile"
                children={<AccountBox fontSize="large" />}
                onClick={() => toggleClickState(eClickedBtn.PROFILE)}
              />
            </div>
            <div className={BUTTON_STYLE}>
              <ListItemButtonLink
                sx={sx}
                to={clickState !== eClickedBtn.FRIENDS ? './friends' : '/'}
                tooltipTitle="Friends"
                children={<Group fontSize="large" />}
                onClick={() => toggleClickState(eClickedBtn.FRIENDS)}
              />
            </div>
            <div className={BUTTON_STYLE}>
              <ListItemButtonLink
                sx={sx}
                to={clickState !== eClickedBtn.ROOMS ? './channels ' : '/'}
                tooltipTitle="Rooms"
                children={<Chat fontSize="large" />}
                onClick={() => toggleClickState(eClickedBtn.ROOMS)}
              />
            </div>
            <div className={BUTTON_STYLE}>
              <ListItemButtonLink
                sx={sx}
                tooltipTitle={'Settings'}
                to={'/'}
                onClick={() => {
                  console.log(openSetting);
                  setOpenSetting(true);
                }}
                children={<Settings fontSize="large" />}
              />
              {/* Dialog */}
              <SettingDialog open={openSetting} setOpen={setOpenSetting} />
            </div>
          </List>
        </Drawer>
      </Box>
    </>
  );
}
