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
import {useEffect, useState} from "react";
import {useAlert} from "@/context/AlertContext";

const Row = (props: { index: number; style: React.CSSProperties; data?: API.History[] }) => {
  {/*TODO: CSS 작업하기! */}
  const { index, style, data } = props;
  // const [singleHistory, setSingleHistory] = useState<API.History>();
  let history;
  if (data) {
    history = data[index];
  }

  return (
    <ListItem style={style} key={index} divider={true} sx={{ display: 'inline' /* flex 끄기 위함. */ }}>
      {history ? (
          `${history.user_nickname} ${history.user_score} vs ${history.target_nickname} ${history.target_score}`
      ) : (
        <Box sx={{ pt: 0.5 }}>
          {/* While loading */}
          <Skeleton width="100%" />
        </Box>
      )}
    </ListItem>
  );
};

interface statisticsListProps {
  historyList?: API.History[];
}

function StatisticsList({ historyList }: statisticsListProps) {
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
        itemCount={historyList ? historyList.length : 5}
        overscanCount={5}
        itemData={historyList}
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
  const [historyList, setHistoryList] = useState<API.History[]>();
  const {handleAlert} = useAlert();

  useEffect(() => {
    if (!userData) return;
    (async () => {
      const res = await API.getUserHistoryById(handleAlert, userData.user_id);
      if (res) {
        setHistoryList(res);
      }
    })(/* IIFE */);
  }, [userData]);


  return (
    <div className=" max-w-full">
      {userData ? (
        <Box className=" p-5 bg-slate-50 border">
          {/*TODO: CSS 작업하기! */}
          {`Total:${userData.total} Win:${userData.wins} Lose:${userData.losses} Level:${userData.level}`}
        </Box>
      ) : (
        <Box sx={{ pt: 0.5 }}>
          <Skeleton width="100%" />
        </Box>
      )}
      <StatisticsList historyList={historyList} />
    </div>
  );
}
