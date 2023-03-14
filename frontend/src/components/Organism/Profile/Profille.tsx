/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Profille.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 21:41:20 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 18:26:33 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Avatar from '@mui/material/Avatar';
import React, {useEffect, useState} from "react";
import { ItemButtonLink } from "@/components/Organism/Controller/Controller";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Skeleton } from '@mui/material';
import type { user_t } from '@/types/user';
import type { userStatistic_t } from '@/types/user';
import type { recentGames_t } from '@/types/user';
import { height } from '@mui/system';
import 'react-lazy-load-image-component/src/effects/blur.css';
// ---------------------------------


const meTest: user_t = {
    imgSrc: "https://www.richardtmoore.co.uk/wp-content/uploads/2016/10/btx-avatar-placeholder-01-2.jpg",
    name: "sungjpar",
}

const opponentTest: user_t = {
    imgSrc: "https://media.licdn.com/dms/image/C4E03AQFWFZ4mjs0CqA/profile-displayphoto-shrink_800_800/0/1517455268292?e=2147483647&v=beta&t=EkD3zEwwCCSfvMTaCYQ5rHyPnG5A8y3Z40lK_sIQ9BQ",
    name: "schoe",
}

const recentGamesTest: recentGames_t = [];
for (let i=0; i< 5; ++i) {
    recentGamesTest.push({
        opponent: opponentTest,
        isWin: true,
    })
}


const userStatisticTest: userStatistic_t = {
    totalGame   : 5,
    totalWin    : 3,
    totalLose   : 2,
    recentGames : recentGamesTest,
}

// ---------------------------------

export interface profileProps {
    userId?: string, // 일단 테스트용이니까 옵션으로 지정함. 나중엔 반드시 userId 전달해줄 것.
}

export default function Profle( {userId}: profileProps ) {
    
    const [profileState, setProfileState] = useState<user_t | null>(null);
    const [statisticState, setStatisticState] = useState<userStatistic_t | null >(null);

    const TEST_TIME_MILLIES = 0;

    const getUserStatisticData = () => {
        return new Promise<userStatistic_t>((resolve, reject) => {
            setTimeout(() => {
                resolve(userStatisticTest);
            }, TEST_TIME_MILLIES);
        });
    };

    const getUserProfileData = () => {
        return new Promise<user_t>((resolve, reject) => {
            setTimeout(() => {
                resolve(meTest);
            }, TEST_TIME_MILLIES); 
        });
    }

    // (1) initial data loading
    useEffect(() => {

        (async () => {
            const profile = await getUserProfileData();
            setProfileState(profile);
        })(/* IIFE */);

        (async () => {
            const statistic = await getUserStatisticData();
            setStatisticState(statistic);
        })(/* IIFE */);
    }, []);

    return (
        <>
            <div
                className=" max-w-full h-72" /* 부모 컴포넌트의 width를 가득 채움 */
            >
                {profileState ? (
                    <LazyLoadImage 
                    src={profileState.imgSrc}
                    width="100%" height="100%"
                    alt={profileState.name}
                    placeholderSrc={profileState.imgSrc}
                    effect="blur" 
                    />
                ) : (
                    <Skeleton
                        variant="rectangular"
                        animation="pulse"
                        width="100%" height="100%"
                    />
                )}
            </div>
        </>
    );
}