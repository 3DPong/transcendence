/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Controller.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/12 23:04:13 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/23 22:11:09 by minkyeki         ###   ########.fr       */
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
import { useNavigate } from "react-router";

export enum eClickedBtn {
    NONE,
    PROFILE,
    FRIENDS,
    ROOMS,
    SETTINGS,
}

export default function Controller() {

    const [clickState, setClickState] = React.useState<eClickedBtn>(0);
    const { loggedUserId } = React.useContext(GlobalContext);

    // ---------------------------------------------------------------
    // 첫 렌더시에 userId가 세팅이 되어 있는지 검증! 여기서 userID가 세팅이 안되면 강제 signin 리다이렉트로 감.
    // 어떻게 생각하면 강제 로그인 검사임 (프론트 차원)
    const navigate = useNavigate();
    React.useEffect(() => {
        if (!loggedUserId) { // 로그인 유저 데이터가 없다면 login page로 이동.
            alert("no login info. redirecting to signin page...");
            navigate("/signin");
        }
    }, []);
    // ---------------------------------------------------------------

    const toggleClickState = (srcState: eClickedBtn) => {
        setClickState( (clickState !== srcState) ? srcState : eClickedBtn.NONE);
    }

    const BUTTON_STYLE = ""

    return (
        // <Box sx={{ display: "flex" }}>
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
    );
}
