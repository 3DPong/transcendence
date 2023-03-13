/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Controller.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/12 23:04:13 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 06:25:29 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

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

interface ItemLinkProps {
    icon?: React.ReactElement;
    primary: string;
    to: string;
    sx?: SxProps;
}

interface ListItemLinkProps {
    icon?: React.ReactElement;
    primary: string;
    to: string;
    badge?: number; // 새로운 이벤트 발생시, 그 알림 숫자를 표시.
}


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

export function ItemButtonLink(props: ItemLinkProps) {
    const { icon, primary, to, sx} = props;
    return ( 
        <Tooltip title={primary} placement="bottom-start">
            <ListItemButton component={Link} to={to}>
                {icon ? (
                    <IconButton aria-label={primary} sx={sx}>
                        {icon}
                    </IconButton>
                ) : null}
            </ListItemButton>
        </Tooltip>
    );
}

export function ListItemButtonLink(props: ListItemLinkProps) {
    const { icon, primary, to, badge } = props;
  
    return (
        <li>
            <Tooltip title={primary} placement="right-start">
                <ListItemButton component={Link} to={to}>
                    {icon ? (
                        <ListItemIcon aria-label={notificationsLabel(badge ? badge : 0)} sx={{ minWidth: 0, mr: "auto", justifyContent: "center"}}>
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


export default function Controller() {

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
                    <ListItemButtonLink to="/profile" primary="Profile" icon={ <AccountBox fontSize="large"/> } />
                    <ListItemButtonLink to="/friends" primary="Friends" icon={ <Group fontSize="large"/> } badge={3}/>
                    <ListItemButtonLink to="/rooms"   primary="Rooms"   icon={ <Chat fontSize="large"/> } />
                    <ListItemButtonLink to="/settings" primary="Settings" icon={ <Settings fontSize="large"/> } />
                </List>
            </Drawer>
        </Box>
    );
}
