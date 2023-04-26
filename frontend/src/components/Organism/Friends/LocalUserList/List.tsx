/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UserList.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 01:51:16 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/19 19:50:01 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, {useContext, useEffect, useState} from 'react';
import {friendData_t} from '@/types/user';
import UserListRow from '@/components/Organism/Friends/LocalUserList/UserListRow';
import {Badge, Box, Card, ListItem} from '@mui/material';
import {FixedSizeList} from 'react-window';
import {Assert} from '@/utils/Assert';
import ActionMenu from '@/components/Organism/Friends/LocalUserList/ActionMenu';
import GlobalContext from '@/context/GlobalContext';
import * as API from '@/api/API';
import {useAlert} from "@/context/AlertContext";
import {useSocket} from "@/context/SocketContext";
import {userStatus, UserStatusNotifyData} from "@/types/notify";

import {createTheme, ThemeProvider} from '@mui/material/styles';
import {green, grey} from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      // Purple and green play nicely together.
      main: green[300],
    },
    secondary: {
      // This is green.A700 as hex.
      main: grey[300],
    },
  },
});

const Row = (props: { index: number; style: React.CSSProperties; data: { isLoading: boolean } }) => {
  const { index, style, data } = props;
  const { friends } = useContext(GlobalContext);
  const friend = friends[index];

  return (
      <ThemeProvider theme={theme}>
        <ListItem style={style} key={index} divider={true}>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between'}}>
            <Badge
                color={
                  friend.status === userStatus.ONLINE ? "primary" : "secondary"
                }
                badgeContent={ friend.status === userStatus.ONLINE ? "online" : "offline" }
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
            >
              <Card sx={{ flex: 1, p: 1 }}>
                <UserListRow user={friend} isLoading={data.isLoading} />
              </Card>
            </Badge>
          </Box>
          <ActionMenu user={friend} />
        </ListItem>
      </ThemeProvider>
  );
};

export interface UserListProps {
  searchString?: string;
}

export default function VirtualizedUserList(props: UserListProps) {
  const { friends, setFriends } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleAlert } = useAlert();
  const { notifySocket } = useSocket();

  useEffect(() => {
    if (!notifySocket) return ;
    function onFriendStatusNotify(notifyData: UserStatusNotifyData) {
      // (4) update Friend online/offline status
      console.log(`[notifySocket] friend ${notifyData.nickname} is ${notifyData.status ? "offline" : "online"}`);
      setFriends((draft) => {
        const targetUser = draft.find((m) => m.user_id === notifyData.user_id);
        if (targetUser) {
          targetUser.status = notifyData.status;
        }
      });
    }
    console.log('[DEV] notifySocket.on() : userStatus');
    notifySocket.on("user_status", onFriendStatusNotify);
    return () => {
      notifySocket.off("user_status", onFriendStatusNotify);
    }
  }, [notifySocket]);

  // on first render
  useEffect(() => {
    (async () => {
      // 0. load start (used at MUI Skeleton)
      setIsLoading(true);
      // 1. 일단 userId를 불러와야 함.
      const userList = await API.getUserListByRelationType(handleAlert, API.GET_RelationType.friend);
      if (!userList) {
        return;
      }
      const friendsList: friendData_t[] = userList.map((relation) => {
        return {
          user_id: relation.target_id,
          nickname: relation.nickname,
          profile_url: relation.profile_url,
          status: (relation.status === userStatus.ONLINE) ? userStatus.ONLINE : userStatus.OFFLINE,
        };
      });
      setFriends(friendsList);
      setIsLoading(false); // load finish
    })(/* IIFE */);
  }, []);

  const LIST_HEIGHT = 400;
  const ROW_WIDTH = '100%';
  const ROW_HEIGHT = 100;

  let searchedArray: Array<friendData_t> | null;
  if (props.searchString) {
    searchedArray = friends.filter((user) => {
      Assert.NonNullish(props.searchString, 'search string is null');
      Assert.NonNullish(user.nickname, '서버에서 null 들어옴.');
      Assert.NonNullish(user.profile_url, '서버에서 null 들어옴.');
      return user.nickname.includes(props.searchString);
    });
  } else {
    searchedArray = friends;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: 400,
        maxWidth: 360,
        bgcolor: 'background.paper',
      }}
    >
      {/* Virtualization for performance. --> react window */}
      {/* https://medium.datadriveninvestor.com/handling-lists-with-react-window-79c68a73c55a */}
      {/* https://mui.com/material-ui/react-list/ */}
      <FixedSizeList
        height={LIST_HEIGHT}
        width={ROW_WIDTH}
        itemSize={ROW_HEIGHT}
        itemCount={searchedArray.length}
        overscanCount={5}
        itemData={{ isLoading: isLoading }}
        className=" scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200" // Scrollbar css
      >
        {Row}
      </FixedSizeList>
    </Box>
  );
}
