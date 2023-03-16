/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UserCard.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/11 16:30:55 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 04:34:09 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * @link https://mui.com/material-ui/react-menu/
 */

import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import React from 'react';
import Tooltip from '@mui/material/Tooltip';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Badge from '@mui/material/Badge';

import { styled } from '@mui/system';
import { createTheme } from '@mui/material/styles';
import { user_t, userListData_t, eUserStatus } from '@/types/user';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { BorderOuter } from '@mui/icons-material';
import ButtonLink from '@/components/Molecule/Link/ButtonLink';

// https://stackoverflow.com/questions/42253277/react-router-v4-how-to-get-current-route
import { useLocation } from 'react-router-dom'
// https://stackoverflow.com/questions/29244731/how-to-manually-invoke-link-in-react-router
import { useNavigate } from 'react-router-dom';
import { circleOfConfusionPixelShader } from '@babylonjs/core/Shaders/circleOfConfusion.fragment';


interface userActionMenuProps {
    user : userListData_t
}

function UserActionMenu(props: userActionMenuProps) {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // React Router useNavigate hook (프로필 보기 클릭시 이동)
    const navigate = useNavigate();

    // 프로필 보기 버튼
    const handleProfileRoute = () => {
        setAnchorEl(null);
        navigate( `/friends/${props.user.profile.id}` );
    }

    // DM 보내기 버튼
    const handleSendMessageRoute = () => {
        setAnchorEl(null);
        console.log("DM 보내기")
        // ...
    }

    // 차단하기 버튼
    const handleBlockRoute = () => {
        setAnchorEl(null);
        console.log("친구 차단")
        // ...
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Tooltip title="UserActionMenu">
                <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={open ? "user-menu" : undefined}
                    aria-expanded={open ? "true" : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                    size="small"
                >
                    {/* <MoreVertIcon /> */}
                    <MoreHorizIcon />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        "&:before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >


                <MenuItem onClick={handleProfileRoute} disableRipple>
                    {/* <EditIcon /> */}
                    See profile
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem onClick={handleSendMessageRoute} disableRipple>
                    {/* <FileCopyIcon /> */}
                    Send messege
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem onClick={handleBlockRoute} disableRipple>
                    {/* <ArchiveIcon /> */}
                    Block user
                </MenuItem>


            </Menu>
        </div>
    );
}

export interface UserCardProps {
    user: userListData_t
    isLoading?: boolean, // for skeleton
};

export default function UserListCard(props: UserCardProps) {
    
    /***********************************************
     * [ How to Create styled Component ]          *
     * https://mui.com/system/styled/#main-content *
     *                                             *
    ***********************************************/
   
    const isOnline = (status: eUserStatus) => {
        return (status === eUserStatus.online);
    }

    return (
        // 부모 flex container에 꽉 채우기 위한 용도 div
        <div className="flex-1 border border-green-700">

            <div className=" w-auto flex items-center">

                {/* (1) 프로필 사진 */}
                { props.isLoading ? (
                        <Skeleton animation="wave" variant='rectangular'>
                            <Avatar variant='square' />
                        </Skeleton>
                    ) : (
                        <Badge /* User [online/offline] 여부 표시 */
                        sx={{ "& .MuiBadge-badge" : {
                            backgroundColor: (isOnline(props.user.status)) ? ("lightgreen") : ("lightgray"),
                            border: 1
                        }}}
                        badgeContent={1}
                        variant="dot"
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}>
                            <Avatar variant='square' alt={props.user.profile.name} src={props.user.profile.imgSrc} />
                        </Badge>
                    )
                }

                {/* (2) 프로필 이름 */}
                <div className="flex-1 ml-2 mr-2">
                    <Typography variant="subtitle1" component="div">
                        {(props.isLoading) ? (<Skeleton/>) : ( props.user.profile.name )}
                    </Typography>
                </div>

                {/* 차단 버튼, DM 보내기 버튼.*/}
                <div className="">
                    <UserActionMenu user={props.user}/>
                </div>

            </div>
        </div>
    );
}