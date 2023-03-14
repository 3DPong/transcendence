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
import type { user_t } from '@/types/user';
import UserListCard from '@/components/Molecule/UserListCard';
import { Box } from '@mui/material';
import { FixedSizeList } from 'react-window';
import { Assert } from '@/utils/Assert';
import ListItemButtonLink from '@/components/Molecule/Link/ListItemButtonLink';

export interface UserListProps {
    users: Array<user_t>,
    isLoading?: boolean,
    searchString?: string,
}


const Row = (props: {index: number, style: React.CSSProperties, data: {users: Array<user_t>, isLoading?: boolean}}) => {
    const { index, style, data } = props;
    const user = data.users[index];
    const { isLoading } = data;

    return (
        <ListItemButtonLink style={style} key={user.name} divider={true}
                            to={ (user.id !== undefined) ? (`./${user.id}`) : ("./") } // if Id exist, then route to [friends/:id]
                            tooltipTitle={"Profile"}>
                <UserListCard
                    imgSrc={user.imgSrc}
                    name={user.name}
                    isLoading={isLoading}
                />
        </ListItemButtonLink>
    );
}


export default function VirtualizedUserList(props: UserListProps) {

    let searchedArray: Array<user_t> | null = null;
    if (props.searchString) {
        searchedArray = props.users.filter((user) => {
            Assert.NonNullish(props.searchString, "search string is null");
           return user.name.includes(props.searchString);
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
                height={400}
                width="100%"
                itemSize={60}
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