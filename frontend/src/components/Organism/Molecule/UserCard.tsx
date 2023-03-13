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

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';



export interface UserCardProps {
    imgSrc?: string,
    name?: string,
    isLoading?: boolean, // for skeleton
};

export default function UserCard(props: UserCardProps) {
    return (
        <ListItem alignItems="flex-start" disablePadding>
            <ListItemAvatar>
                {props.isLoading ? (
                    <Skeleton variant="circular" animation="wave">
                        <Avatar />
                    </Skeleton>
                ) : (
                    <Avatar alt={props.name} src={props.imgSrc} />
                )
                }
            </ListItemAvatar>

            <ListItemText
                primary={
                    props.isLoading ? (
                        <Skeleton 
                            animation="wave" 
                            height={10} 
                            width="40%"
                            style={ { marginBottom:6, marginTop:6 } }
                            />
                    ) : (
                        props.name
                    )
                }
                secondary={
                    props.isLoading ? (
                        <Skeleton 
                        animation="wave" 
                        height={10} 
                        width="80%"
                        />
                    ) : (
                        <React.Fragment>
                            <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                additional data here
                            </Typography>
                        </React.Fragment>
                    )
                }
            />
        </ListItem>
    );
}