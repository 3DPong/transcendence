/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UserList.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 01:51:16 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/20 17:33:57 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from "react";
import { ListItem } from "@mui/material";
import UserListRow from "@/components/Organism/Friends/GlobalUserList/UserListRow";
import { Box } from "@mui/material";
import { globalUserData_t, friendData_t } from "@/types/user";
import { FixedSizeList } from "react-window";
import { UpdateFunctionOverload } from "@/utils/CustomHooks/useArray";
import ActionMenu from "@/components/Organism/Friends/GlobalUserList/ActionMenu";

const Row = (props: {
  index: number;
  style: React.CSSProperties;
  data: {
    globalUsers: Array<globalUserData_t>;
    setGlobalUsers: UpdateFunctionOverload<globalUserData_t>;
    isLoading: boolean;
  };
}) => {
  const { index, style, data } = props;
  const user = data.globalUsers[index];

  return (
    <ListItem style={style} key={index} divider={true}>
      <UserListRow user={user} isLoading={data.isLoading} />
      <ActionMenu user={user} setGlobalUsers={props.data.setGlobalUsers} />
    </ListItem>
  );
};

export interface UserListProps {
  globalUsers: Array<globalUserData_t>;
  setGlobalUsers: UpdateFunctionOverload<globalUserData_t>;
  isLoading: boolean;
}

export default function VirtualizedUserList(props: UserListProps) {
  const LIST_HEIGHT = 400;
  const ROW_WIDTH = "100%";
  const ROW_HEIGHT = 70;

  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
        maxWidth: 360,
        bgcolor: "background.paper",
      }}
    >
      {/* Virtualization for performance. --> react window */}
      {/* https://medium.datadriveninvestor.com/handling-lists-with-react-window-79c68a73c55a */}
      {/* https://mui.com/material-ui/react-list/ */}
      <FixedSizeList
        height={LIST_HEIGHT}
        width={ROW_WIDTH}
        itemSize={ROW_HEIGHT}
        itemCount={props.globalUsers.length}
        overscanCount={5}
        itemData={{
          globalUsers: props.globalUsers,
          setGlobalUsers: props.setGlobalUsers,
          isLoading: props.isLoading,
        }}
        // Scrollbar css
        className=" scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
      >
        {Row}
      </FixedSizeList>
    </Box>
  );
}
