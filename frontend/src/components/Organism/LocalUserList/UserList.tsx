/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UserList.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 01:51:16 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 16:28:50 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * Handling Performance with Virtualization.
 * @link1 : https://mui.com/material-ui/react-list/
 */

import * as React from 'react';
import { user_t, userListData_t, eUserStatus } from '@/types/user';
import UserListCard from '@/components/Organism/LocalUserList/UserListCard';
import { Badge, Box } from '@mui/material';
import { FixedSizeList } from 'react-window';
import { Assert } from '@/utils/Assert';
import ListItemButtonLink from '@/components/Molecule/Link/ListItemButtonLink';
import { ListItem } from '@mui/material';

const Row = (props: {index: number, style: React.CSSProperties, data: {users: Array<userListData_t>, isLoading?: boolean}}) => {
    const { index, style, data } = props;
    const user = data.users[index];
    const { isLoading } = data;

    return (
        // <ListItemButtonLink /*style={style}*/ key={user.name} divider={true}
        //                     to={ (user.id !== undefined) ? (`./${user.id}`) : ("./") } // if Id exist, then route to [friends/:id]
        //                     tooltipTitle={"Profile"}
        //                     >
        // 기존에는 리스트 전체를 click가능하게 했었는데, 지금은 오른쪽 option 버튼 누르도록...
        <ListItem
            style={style}
            key={index}
            divider={true}
        >
            {/* block된 유저인지 아닌지 체크 + 로그인/ 로그아웃 상태 검사 */}
            {/* <Badge
                color={
                    user.status === eUserStatus.online ? "primary" : "secondary"
                }
                variant="dot"
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
            > */}
                {/* 한 리스트 칸에 들어가는 내용 (프로필, 이름, 옵션) (flex container) */}
                <UserListCard
                    user={user}
                    isLoading={isLoading}
                />
            {/* </Badge> */}
        </ListItem>

        // </ListItemButtonLink>
    );
}

export interface UserListProps {
    users: Array<userListData_t>,
    isLoading?: boolean,
    searchString?: string,
}

export default function VirtualizedUserList(props: UserListProps) {

    const LIST_HEIGHT = 400;
    const ROW_WIDTH = "100%"
    const ROW_HEIGHT = 70;

    let searchedArray: Array<userListData_t> | null = null;
    if (props.searchString) {
        searchedArray = props.users.filter((user) => {
            Assert.NonNullish(props.searchString, "search string is null");
           return user.profile.name.includes(props.searchString);
        });
    } else {
        searchedArray = props.users;
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
                itemCount={ searchedArray.length }
                overscanCount={5}
                itemData={ { users : searchedArray, isLoading : props.isLoading } }
                // Scrollbar css
                className=" scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
            >
                {Row}
            </FixedSizeList>
        </Box>
    );
}