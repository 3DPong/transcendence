/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ActionMenu.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/18 15:28:53 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/23 16:57:47 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * @link https://mui.com/material-ui/react-menu/
 */

import React, { useContext } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { friendData_t, globalUserData_t } from "@/types/user";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import GlobalContext from "@/context/GlobalContext";
import { UpdateFunctionOverload } from "@/utils/CustomHooks/useArray";
import { Assert } from "@/utils/Assert";
import * as API from "@/api/API";

interface userActionMenuProps {
  user: globalUserData_t;
  setGlobalUsers: UpdateFunctionOverload<globalUserData_t>;
}

export default function UserActionMenu({ user, setGlobalUsers }: userActionMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate(); // React Router useNavigate hook (프로필 보기 클릭시 이동)
  const { setFriends } = useContext(GlobalContext);

  // 프로필 보기 버튼
  const handleProfileRoute = () => {
    setAnchorEl(null);
    navigate(`./${user.user_id}`); // L3 Template
  };

  // DM 보내기 버튼
  const handleSendMessageRoute = () => {
    setAnchorEl(null);
    console.log("DM 보내기");
    // ...
  };

  // 친구 추가 버튼
  const handleAddFriend = () => {
    console.log("Add friend");
    setAnchorEl(null);
    (async () => {
      // (1) call API POST "add friend". https://github.com/3DPong/transcendence/issues/43
      const RESPONSE = await API.changeUserRelation(user.user_id, API.PUT_RelationActionType.addFriend);
      if (RESPONSE?.status !== "friend") {
        // server handle error
        alert("[SERVER]: 친구가 추가 되지 않았습니다.");
        return;
      }
      // (2) create user data format with POST response
      const NEW_FRIEND: friendData_t = {
        user_id: RESPONSE.target_id,
        profile_url: user.profile_url,
        nickname: user.nickname,
        // status: user.status, // ?
      };
      // (3) add to friendList
      setFriends((draft) => {
        draft.unshift(NEW_FRIEND);
      });
      // (4) delete from global-userList
      setGlobalUsers((draft) => {
        const targetIndex = draft.findIndex((m) => m.user_id === user.user_id);
        if (targetIndex !== -1) draft.splice(targetIndex, 1);
      });
    })(/* IIFE */);
  };

  // 친구라면 사용자 차단 (block User), 친구가 아니라면 (add friend | block user)
  const handleBlockUserToogle = () => {
    console.log("Block/Unblock global user");
    setAnchorEl(null);
    (async () => {
      // (1) call API POST "add friend". https://github.com/3DPong/transcendence/issues/43
      let action;
      if (user.status === "block") {
        // if block
        action = API.PUT_RelationActionType.unBlockUser;
      } else {
        // friend or none
        action = API.PUT_RelationActionType.blockUser;
      }
      // (2) check API response
      const RESPONSE = await API.changeUserRelation(user.user_id, action);
      if (action === API.PUT_RelationActionType.unBlockUser && RESPONSE?.status === "block") {
        // block handle error (no change)
        alert("[SERVER]: 유저의 차단관계 처리 에러");
        return;
      } else if (action === API.PUT_RelationActionType.blockUser && RESPONSE?.status !== "block") {
        // block handle error (no change)
        alert("[SERVER]: 유저의 차단관계 처리 에러");
        return;
      }
      // (3) if user is friend, delete from friend list (전체 사용자 리스트와 친구 리스트에 동시에 보여지고 있을 수 있기 때문)
      if (user.status === "friend") {
        setFriends((draft) => {
          const targetIndex = draft.findIndex((m) => m.user_id === user.user_id);
          if (targetIndex !== -1) draft.splice(targetIndex, 1);
        });
      }
      // (4) update Global User List
      setGlobalUsers((draft) => {
        const targetUser = draft.find((m) => m.user_id === user.user_id);
        Assert.NonNullish(targetUser, "리스트 검색 오류"); // 같은 리스트상에서는 반드시 있어야 함.
        if (RESPONSE) {
          targetUser.status = RESPONSE.status;
        }
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

        {/* Add friend handle  --> don't show if user is already a friend*/}
        {user.status !== "friend" && <MenuItem onClick={handleAddFriend} children={"Add friend"} disableRipple />}

        {/* Block User tooggle */}
        <MenuItem onClick={handleBlockUserToogle} disableRipple>
          {user.status === "none" && "block user"}
          {user.status === "friend" && "delete/block friend"}
          {user.status === "block" && "unblock user"}
        </MenuItem>
      </Menu>
    </div>
  );
}
