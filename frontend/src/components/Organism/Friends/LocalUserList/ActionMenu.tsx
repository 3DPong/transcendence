/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ActionMenu.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/18 15:28:53 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/21 06:07:14 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, { useContext } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import GlobalContext from "@/context/GlobalContext";
import { userListData_t } from "@/types/user";
import { Assert } from "@/utils/Assert";
import * as API from "@/api/API";

interface userActionMenuProps {
  user: userListData_t;
}

export default function UserActionMenu({user}: userActionMenuProps) {

  const { setFriends } = useContext(GlobalContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // React Router useNavigate hook (프로필 보기 클릭시 이동)
  const navigate = useNavigate();

  // 프로필 보기 버튼
  const handleProfileRoute = () => {
    setAnchorEl(null);
    navigate(`/friends/${user.profile.id}`);
  };

  // DM 보내기 버튼
  const handleSendMessageRoute = () => {
    setAnchorEl(null);
    console.log("DM 보내기");
    // ...
  };

  // 친구 삭제 버튼
  const handleDeleteFriend = () => {
    console.log("Delete friend");
    setAnchorEl(null);
    (async () => {
      // (1) call API POST "add friend". https://github.com/3DPong/transcendence/issues/43
      const RESPONSE = await API.changeUserRelation(user.profile.id, API.RelationAction.addFriend);
      if (RESPONSE.friend === true) { // server handle error
        alert("[SERVER]: 친구가 삭제 되지 않았습니다.")
        return ;
      }
      // (2) delete from friendList
      setFriends((draft) => { 
        const targetIndex = draft.findIndex((m) => m.profile.id === user.profile.id);
        if (targetIndex !== -1) draft.splice(targetIndex, 1);
      });
    })(/* IIFE */);
  };

  // 사용자 차단하기 버튼
  const handleBlockUserToogle = () => {
    console.log("Block/Unblock friend");
    setAnchorEl(null);

    (async () => {
      // (1) call API POST "add friend". https://github.com/3DPong/transcendence/issues/43
      const RESPONSE = await API.changeUserRelation(
        user.profile.id,
        user.isBlocked ? API.RelationAction.unBlockUser : API.RelationAction.blockUser
      );
      if (RESPONSE.block === undefined || RESPONSE.block === user.isBlocked) { // block handle error (no change)
        alert("[SERVER]: 유저의 차단관계 처리 에러")
        return ;
      }
      // (3) update to Global User List (친구 리스트에 있을 수도 있음...)
      setFriends((draft) => {
        const targetFriend = draft.find((m) => m.profile.id === user.profile.id);
        if (!targetFriend) return; // 친구 리스트에 없으면 return
        targetFriend.isBlocked = !targetFriend.isBlocked;
      });
    })(/* IIFE */);
  };

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
        {/* show profile route */}
        <MenuItem onClick={handleProfileRoute} children={"See profile"} disableRipple />

        <Divider sx={{ my: 0.5 }} />

        {/* go to DM room route */}
        <MenuItem onClick={handleSendMessageRoute} children={"Send messege"} disableRipple />

        <Divider sx={{ my: 0.5 }} />

        {/* Delete friend handle */}
        <MenuItem onClick={handleDeleteFriend} children={"Delete friend"} disableRipple />

        {/* Block User tooggle */}
        <MenuItem onClick={handleBlockUserToogle} disableRipple>
          {user.isBlocked ? "UnBlock user" : "Block user"}
        </MenuItem>
      </Menu>
    </div>
  );
}