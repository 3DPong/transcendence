/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Controller.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/12 23:04:13 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 21:34:04 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";

import { AccountBox, Group, Chat, Settings } from "@mui/icons-material";

/**
 * Drawer MUI
 * - @link1 https://mui.com/material-ui/react-drawer/#permanent-drawer
 * 
 * SVG Icons
 * - @link2 https://mui.com/material-ui/material-icons/
 * 
 * React Routing
 * - @link3 https://mui.com/material-ui/guides/routing/#list
 */

import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
    Route,
    Routes,
    MemoryRouter,
    useLocation,
} from 'react-router-dom';

import Tooltip from '@mui/material/Tooltip'; // 마우스 hover시에 힌트 뜨기 위함.
import Badge from "@mui/material/Badge";
import { IconButton, SxProps } from "@mui/material";
import { colorChannel } from "@mui/system";

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(
        itemProps,
        ref,
    ) {
        return <RouterLink ref={ref} {...itemProps} role={undefined} />;
});

/** Provide a full description, for instance, with #aria-label.
 * @link1 https://mui.com/material-ui/react-badge/
 */
function notificationsLabel(count: number) {
    if (count === 0) {
        return 'no notifications';
    }
    if (count > 99) {
        return 'more than 99 notifications';
    }
    return `${count} notifications`;
}

interface ItemLinkProps {
    icon?: React.ReactElement;
    primary: string;
    to: string;
    sx?: SxProps;
}

export function ItemButtonLink(props: ItemLinkProps) {
    const { icon, primary, to, sx} = props;
    return ( 
        <Tooltip title={primary} placement="bottom-start">
            <ListItemButton component={Link} to={to} sx={{margin:0, padding:0}}>
                {icon ? (
                    <IconButton aria-label={primary} sx={sx} disableFocusRipple disableTouchRipple disableRipple>
                        {icon}
                    </IconButton>
                ) : null}
            </ListItemButton>
        </Tooltip>
    );
}

interface ListItemLinkProps {
    icon?: React.ReactElement;
    primary: string;
    to: string;
    badge?: number; // 새로운 이벤트 발생시, 그 알림 숫자를 표시.
    onClick?: () => void;
}

export function ListItemButtonLink(props: ListItemLinkProps) {
    const { icon, primary, to, badge, onClick } = props;

    return (
        <li>
            <Tooltip title={primary} placement="right-start">
                <ListItemButton component={Link} to={to}>
                    {icon ? (
                        <ListItemIcon onClick={onClick} aria-label={notificationsLabel(badge ? badge : 0)} sx={{ minWidth: 0, mr: "auto", justifyContent: "center"}}>
                            <Badge badgeContent={props.badge} color="primary" max={99}>
                                {icon}
                            </Badge>
                        </ListItemIcon>
                    ) : null}
                    {/* <ListItemText primary={primary} /> */}
                </ListItemButton>
            </Tooltip>
        </li>
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

    const [clickState, setClickState] = React.useState<eClickedBtn>(0);

    const toggleClickState = (srcState: eClickedBtn) => {
        setClickState( (clickState !== srcState) ? srcState : eClickedBtn.NONE);
    }

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
                <List>
                    <ListItemButtonLink
                        to={ (clickState !== eClickedBtn.PROFILE) ? "/profile" : "/"}
                        primary="Profile"
                        icon={<AccountBox fontSize="large" />}
                        onClick={() => toggleClickState(eClickedBtn.PROFILE)}
                        badge={0} /** @special 친구 업데이트 등의 이벤트 발생시 여기에 추가. */
                    />
                    <ListItemButtonLink
                        to={ (clickState !== eClickedBtn.FRIENDS) ? "/friends" : "/"}
                        primary="Friends"
                        icon={<Group fontSize="large" />}
                        onClick={() => toggleClickState(eClickedBtn.FRIENDS)}
                        badge={3} /** @special 친구 업데이트 등의 이벤트 발생시 여기에 추가. */
                    />
                    <ListItemButtonLink
                        to={ (clickState !== eClickedBtn.ROOMS) ? "/rooms" : "/"}
                        primary="Rooms"
                        icon={<Chat fontSize="large" />}
                        onClick={() => toggleClickState(eClickedBtn.ROOMS)}
                        badge={5} /** @special 친구 업데이트 등의 이벤트 발생시 여기에 추가. */
                    />
                    <ListItemButtonLink
                        to={ (clickState !== eClickedBtn.SETTINGS) ? "/settings" : "/"}
                        primary="Settings"
                        icon={<Settings fontSize="large" />}
                        onClick={() => toggleClickState(eClickedBtn.SETTINGS)}
                        badge={0} /** @special 친구 업데이트 등의 이벤트 발생시 여기에 추가. */
                    />
                </List>
            </Drawer>
        </Box>
    );
}
