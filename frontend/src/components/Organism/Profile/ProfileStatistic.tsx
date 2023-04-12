/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ProfileStatistic.tsx                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/14 19:51:23 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/23 16:58:57 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import type { userStatistic_t } from '@/types/user';
// import type { recentGames_t } from '@/types/user';
import { Skeleton } from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { FixedSizeList } from 'react-window';
import { ListItem } from '@mui/material';
import * as API from '@/api/API';

const Row = (props: { index: number; style: React.CSSProperties; data?: any }) => {
  const { index, style, data } = props;

  return (
    <ListItem style={style} key={index} divider={true} sx={{ display: 'inline' /* flex 끄기 위함. */ }}>
      {data ? (
        'Recent game result'
      ) : (
        <Box sx={{ pt: 0.5 }}>
          <Skeleton width="100%" />
        </Box>
      )}
    </ListItem>
  );
};

interface statisticsListProps {
  userData?: API.GET_UserDataResponseFormat;
}

function StatisticsList({ userData }: statisticsListProps) {
  const HEIGHT = 250;

  return (
    <Box
      sx={{
        width: '100%',
        height: HEIGHT,
        maxWidth: 360,
        bgcolor: 'background.paper',
      }}
    >
      <FixedSizeList
        height={HEIGHT}
        width="100%"
        itemSize={60}
        itemCount={10}
        overscanCount={5}
        itemData={userData}
        // Scrollbar css
        className=" scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
      >
        {Row}
      </FixedSizeList>
    </Box>
  );
}

interface profileStatisticProps {
  userData?: API.GET_UserDataResponseFormat;
}

export default function ProfileStatistic({ userData }: profileStatisticProps) {
  return (
    <div className=" max-w-full">
      {userData ? (
        <Box className=" p-5 bg-slate-50 border">
          {`Total:${userData.total} Win:${userData.wins} Lose:${userData.losses} Level:${userData.level}`}
        </Box>
      ) : (
        <Box sx={{ pt: 0.5 }}>
          <Skeleton width="100%" />
        </Box>
      )}
      <StatisticsList userData={userData} />
    </div>
  );
}
