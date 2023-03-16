/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ProfileCard.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/14 20:20:49 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 21:17:13 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { LazyLoadImage } from "react-lazy-load-image-component";
import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { user_t } from '@/types/user';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface profileProps {
    profile? : user_t
}

/**
 *  주의사항! 모든 사진은 1:1 비율되어야 한다. 
 */
function ProfileMedia( { profile }: profileProps ) {
    return (
        <div className=" max-w-full h-72 p-5">
            {profile ? (
                <LazyLoadImage
                    src={profile.imgSrc}
                    alt={profile.name}
                    placeholderSrc={profile.imgSrc}
                    effect="blur"
                />
            ) : (
                <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    height="100%"
                />
            )}
        </div>
    );
}

function ProfileInfo( { profile }: profileProps ) {
    return (
        <div className=" max-w-full h-14 pl-5">
            {profile ? (
                <Typography display="block" variant="h5" color="text.primary">
                    {profile.name}
                </Typography>
            ) : (
                <Box sx={{ pt: 0.5 }}>
                    <Skeleton width="60%" />
                </Box>
            )}
        </div>
    );
}

export default function ProfileCard( { profile }: profileProps ) {

    return (
        <div className=" bg-slate-100">
            <ProfileMedia profile={profile} />
            <ProfileInfo profile={profile} />
        </div>
    );
}