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

import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { Box } from '@mui/system';

export interface UserCardProps {
    imgSrc?: string,
    name?: string,
    isLoading?: boolean, // for skeleton
};

export default function UserListCard(props: UserCardProps) {
    return (
        <div className=" flex">

            <Avatar>
                {props.isLoading ? (
                    <Skeleton variant="circular" animation="wave">
                        <Avatar />
                    </Skeleton>
                ) : (
                    <Avatar alt={props.name} src={props.imgSrc} />
                )
                }
            </Avatar>

            { props.isLoading ? (
                    <Box sx={{ pt: 0.5 }}>
                        <Skeleton animation="wave" width="100%" /> 
                    </Box>
                ) : (
                    <Typography variant="h6" component="div">
                        { props.name }
                    </Typography>
                )
            }

        </div>
    );
}