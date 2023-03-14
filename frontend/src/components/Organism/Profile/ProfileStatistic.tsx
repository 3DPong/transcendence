/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ProfileStatistic.tsx                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/14 19:51:23 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 21:47:50 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { userStatistic_t } from '@/types/user';
import type { recentGames_t } from '@/types/user';
import { Skeleton } from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { FixedSizeList } from 'react-window';
import { ListItem } from '@mui/material';

interface profileStatisticProps {
    statistic? : userStatistic_t,
}

const Row = ( props: { index: number, style: React.CSSProperties, data?: recentGames_t } ) => {

    const { index, style, data } = props;

    return (
        <ListItem style={style} key={index} divider={true}>
            {data ? (
                "test text here"
            ) : (
                <Box sx={{ pt: 0.5 }}>
                    <Skeleton width="100%"/>
                </Box>
            )}
        </ListItem>
    );
}

interface statisticsListProps {
    recentGames? : recentGames_t,
}

function StatisticsList({ recentGames }: statisticsListProps ) {

       return (
        <Box
            sx={{
                width: "100%",
                height: 400,
                maxWidth: 360,
                bgcolor: "background.paper",
            }}
        >

            <FixedSizeList
                height={ 400 }
                width="100%"
                itemSize={60}
                itemCount={ 10 }
                overscanCount={ 5 }
                itemData={ recentGames }
                // Scrollbar css
                className=" scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
            >
                {Row}
            </FixedSizeList>
        </Box>
    );
}

export default function ProfileStatistic( { statistic }: profileStatisticProps ) {

    return (
        <div className=" max-w-full">
            <Typography display="block" variant="body2" color="text.primary">
                total : {statistic?.totalGame}
            </Typography>
            <StatisticsList recentGames={ statistic?.recentGames } />
        </div>
    );
}