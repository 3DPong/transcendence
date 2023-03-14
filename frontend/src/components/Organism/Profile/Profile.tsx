/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Profile.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/14 19:38:02 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 21:40:08 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, {useEffect, useState} from "react";
import ProfileCard from './ProfileCard';

import type { user_t } from '@/types/user';
import type { userStatistic_t } from '@/types/user';
import type { recentGames_t } from '@/types/user';
import ProfileStatistic from "./ProfileStatistic";
// ---------------------------------


const meTest: user_t = {
    imgSrc: "https://www.richardtmoore.co.uk/wp-content/uploads/2016/10/btx-avatar-placeholder-01-2.jpg",
    name: "Nickname",
}

const opponentTest: user_t = {
    imgSrc: "https://media.licdn.com/dms/image/C4E03AQFWFZ4mjs0CqA/profile-displayphoto-shrink_800_800/0/1517455268292?e=2147483647&v=beta&t=EkD3zEwwCCSfvMTaCYQ5rHyPnG5A8y3Z40lK_sIQ9BQ",
    name: "schoe",
}

const recentGamesTest: recentGames_t = [];
for (let i=0; i< 10; ++i) {
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


interface profileProps {
    userId?: string, // 일단 테스트용이니까 옵션으로 지정함. 나중엔 반드시 userId 전달해줄 것.
}

export default function Profle( {userId}: profileProps ) {
    
    const [profileState, setProfileState] = useState<user_t>();
    const [statisticState, setStatisticState] = useState<userStatistic_t>();

    const TEST_TIME_MILLIES = 1000;

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
        <div>
            <ProfileCard profile={ profileState } />
            <ProfileStatistic statistic={ statisticState } />
        </div>
    );
}