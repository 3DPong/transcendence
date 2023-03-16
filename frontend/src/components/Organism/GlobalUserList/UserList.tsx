/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UserList.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 01:51:16 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 16:28:00 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * Handling Performance with Virtualization.
 * @link1 : https://mui.com/material-ui/react-list/
 */

import * as React from 'react';
import { ListItemButton } from '@mui/material';
import { ListItem } from '@mui/material';
import UserListCard from '@/components/Organism/GlobalUserList/UserListCard';
import { Box } from '@mui/material';
import { user_t, userListData_t, eUserStatus } from '@/types/user';
import { FixedSizeList } from 'react-window';

const Row = (props: {index: number, style: React.CSSProperties, data: {users: Array<userListData_t>, isLoading?: boolean}}) => {
    const { index, style, data } = props;
    const user = data.users[index];
    const { isLoading } = data;

    return (
        <ListItem
            style={style}
            key={index}
            divider={true}
        >
            <UserListCard user={user} isLoading={isLoading} />
        </ListItem>
    );
}

export interface UserListProps {
    users?: Array<userListData_t> | null,
    isLoading?: boolean,
}

export default function VirtualizedUserList(props: UserListProps) {

    const LIST_HEIGHT = 400;
    const ROW_WIDTH = "100%"
    const ROW_HEIGHT = 70;

    if (!props.users) { // on initial load
        return (<div></div>)
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
                itemCount={ props.users.length }
                overscanCount={5}
                itemData={ { users : props.users, isLoading : props.isLoading } }
                // Scrollbar css
                className=" scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
            >
                {Row}
            </FixedSizeList>
        </Box>
    );
}