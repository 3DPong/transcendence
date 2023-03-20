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

import React, { useContext, useEffect, useState } from "react";
import { userListData_t } from "@/types/user";
import UserListRow from "@/components/Molecule/UserListRow";
import { Box } from "@mui/material";
import { FixedSizeList } from "react-window";
import { Assert } from "@/utils/Assert";
import { ListItem } from "@mui/material";
import ActionMenu from "@/components/Organism/Friends/LocalUserList/ActionMenu";
import GlobalContext from "@/context/GlobalContext";
import * as API from "@/api/API";

const Row = (props: {
  index: number;
  style: React.CSSProperties;
  data: { isLoading: boolean };
}) => {
  const { index, style, data } = props;
  const { friends } = useContext(GlobalContext);
  const friend = friends[index];

  return (
    // NOTE: MUI ListItem Component는 내부적으로 Flex가 적용됩니다.
    <ListItem style={style} key={index} divider={true}>
      <UserListRow user={friend} isLoading={data.isLoading} />
      <ActionMenu user={friend} />
    </ListItem>
  );
};

export interface UserListProps {
  searchString?: string;
}

export default function VirtualizedUserList(props: UserListProps) {

    const { friends, setFriends } = useContext(GlobalContext);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
 
    // on first render
    useEffect(() => {
        (async () => {
            setIsLoading(true); // load start (used at MUI Skeleton)
            const receivedData = await API.getFriendsListData();
            setFriends(receivedData); // set loaded friend list
            setIsLoading(false); // load finish
        })(/* IIFE */);
    }, []);

    const LIST_HEIGHT = 400;
    const ROW_WIDTH = "100%";
    const ROW_HEIGHT = 70;


    let searchedArray: Array<userListData_t> | null = null;
    if (props.searchString) {
        searchedArray = friends.filter((user) => {
            Assert.NonNullish(props.searchString, "search string is null");
            return user.profile.name.includes(props.searchString);
        });
    } else {
        searchedArray = friends;
    }

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