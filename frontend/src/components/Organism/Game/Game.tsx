/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/25 14:33:43 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/31 18:01:01 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, {
  useState,
  useEffect,
  useRef,
  MutableRefObject,
  forwardRef,
  RefObject,
  memo,
  useContext,
  useMemo
} from "react";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';



import { Renderer3D } from "@/components/Organism/Game/Renderer/Renderer";
import GameStartButton from "@/components/Organism/Game/GameStartButton";
import {useSocket} from "@/context/SocketContext";
import * as gameType from "@/types/game";
import {useError} from "@/context/ErrorContext";
import {Avatar, Box, Skeleton, Typography} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {green} from "@mui/material/colors";
import ClearIcon from "@mui/icons-material/Clear";
import GlobalContext from "@/context/GlobalContext";

export default function Game() {
  const { gameSocket } = useSocket();
  const [matchData, setMatchData] = useState<gameType.matchStartData>();
  const [matchResult, setMatchResult] = useState<gameType.matchResult>();
  const {loggedUserId} = useContext(GlobalContext);

  const [myProfile, setMyProfile] = useState<string>("");
  const [myNickname, setMyNickname] = useState<string>("");
  const [enemyProfile, setEnemyProfile] = useState<string>("");
  const [enemyNickname, setEnemyNickname] = useState<string>("");

  const handleMatchResultDialogClose = () => {
    // setOpen(false);
  };


  useEffect(() => {
    if (!gameSocket) return;

    gameSocket.on("connect_error", (err: Error)=>{
      console.log(`connect error due to ${err.message}`);
      console.log(`error cause : ${err.cause}`);
      console.log(`error name : ${err.name}`);
    })
    gameSocket.on('connect', () => {
      console.log('서버와 연결되었습니다.');
    });
    gameSocket.on('my_connect', () => {
      console.log('nest서버와 연결');
    });
    gameSocket.on('disconnect', () => {
      console.log('서버와의 연결이 끊어졌습니다.');
    });


    // -----------------------------------------------------
    // if game finished
    function handleGameEnd(matchResult: gameType.matchResult) {
      setMatchResult(matchResult);
    }
    gameSocket.on("matchEnd", handleGameEnd);
    // -----------------------------------------------------


    return () => {
      gameSocket.off("connect_error");
      gameSocket.off("connect");
      gameSocket.off("my_connect");
      gameSocket.off("disconnect");

      gameSocket.off("matchEnd", handleGameEnd);
    }
  }, [gameSocket]);


  if (matchData) {
    return (
        <div>
          {/* 게임 렌더링 */}
          <div className=" absolute -z-50 w-0 h-0">
            <Renderer3D matchData={matchData} width={window.innerWidth} height={window.innerHeight} />
          </div>

          {/* 게임 결과 */}
          { matchResult &&
              <Dialog
                  open={!!matchResult}
                  onClose={handleMatchResultDialogClose}
                  aria-labelledby="Match Result"
                  aria-describedby="match Result description"
              >
                <DialogTitle id="alert-dialog-title">
                  {(matchResult.winner === loggedUserId) ? "👑You Win" : "😥You Lose" }
                </DialogTitle>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  {/* (1) 내 프로필 정보 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 4 }}>
                    <Box sx={{ m: 1, position: 'relative' }}>
                      <Avatar
                          alt="me"
                          src={myProfile}
                          sx={{
                            width: '150px',
                            height: '150px',
                          }}
                      />
                    </Box>
                    <Box sx={{ m: 1, position: 'relative' }}>
                      <Typography display="block" variant="h5" color="text.primary">
                        {myNickname}
                      </Typography>
                      <Typography display="block" variant="h3" color="text.primary">
                        {(matchResult.leftPlayerId === loggedUserId) ? matchResult.leftScore : matchResult.rightScore}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 중간 사이 마진 */}
                  <Box/>

                  {/* (2) 상대방 프로필 정보 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 4 }}>
                    <Box sx={{ m: 1, position: 'relative' }}>
                      {/* 매치가 성사됬을 때 상대방 아이콘. */}
                      <Avatar
                          alt="enemy"
                          src={enemyProfile}
                          sx={{
                            width: '150px',
                            height: '150px',
                          }}
                      />
                    </Box>
                    <Box sx={{ m: 1, position: 'relative' }}>
                      <Typography display="block" variant="h5" color="text.primary">
                        {enemyNickname}
                      </Typography>
                      <Typography display="block" variant="h3" color="text.primary">
                        {(matchResult.leftPlayerId === loggedUserId) ? matchResult.rightScore : matchResult.leftScore}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <DialogActions>
                  <Button color="error" variant="contained" startIcon={<ClearIcon />} onClick={handleMatchResultDialogClose} autoFocus>
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
          }

        </div>

    );
  } else {
    return (
      <div className=" flex items-center justify-center h-screen">
        <GameStartButton
            myProfile={myProfile} setMyProfile={setMyProfile}
            myNickname={myNickname} setMyNickname={setMyNickname}
            enemyProfile={enemyProfile} setEnemyProfile={setEnemyProfile}
            enemyNickname={enemyNickname} setEnemyNickname={setEnemyNickname}
            setMatchData={setMatchData}/>
      </div>
    );
  }
}
