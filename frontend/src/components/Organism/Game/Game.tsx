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
  useContext,
} from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Renderer3D from "@/components/Organism/Game/Renderer/Renderer";
import GameStartButton from "@/components/Organism/Game/GameStartButton";
import {useSocket} from "@/context/SocketContext";
import * as gameType from "@/types/game";
import {Avatar, Box, Skeleton, Typography} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import GlobalContext from "@/context/GlobalContext";
import GameMatchingDialog from "@/components/Organism/Game/GameStartButton";

import { MatchDataContext } from "@/context/MatchDataContext";
import { useAlert } from "@/context/AlertContext";
import { Navigate, useNavigate } from "react-router";

export function Game() {
  const {gameSocket } = useSocket();
  const {handleAlert} = useAlert();
  const {loggedUserId} = useContext(GlobalContext);
  const {clearInviteData} = useContext(MatchDataContext);
  const navigate = useNavigate();
  
  const [matchData, setMatchData] = useState<gameType.matchStartData  | gameType.onSceneObserverData| null>();
  const [matchResult, setMatchResult] = useState<gameType.matchResult | null>();
  const [myProfile, setMyProfile] = useState<string>("");
  const [myNickname, setMyNickname] = useState<string>("");
  const [enemyProfile, setEnemyProfile] = useState<string>("");
  const [enemyNickname, setEnemyNickname] = useState<string>("");


  const handleMatchResultDialogClose = () => {
    setMatchData(null);
    setMatchResult(null);
    clearInviteData();
  };

  useEffect(() => {
    if (!gameSocket) return;
    // 게임 도중 발생한 소켓 에러?
    gameSocket.on('error', (message) => {
      handleAlert('Socket Error', message.message);
      clearInviteData();
      gameSocket.emit('exit');
      navigate('/');
    });
     // if game finished
    function handleGameEnd(matchResult: gameType.matchResult) {
      setMatchResult(matchResult);
      clearInviteData();
    }
    gameSocket.on("matchEnd", handleGameEnd);
    return () => {
      gameSocket.off("matchEnd", handleGameEnd);
      gameSocket.off('error');
    }
  }, [gameSocket]); 
  
  const playerData: gameType.PlayerData = {
    leftPlayerNickName: myNickname,
    rightPlayerNickName: enemyNickname,
  }

  if (!matchData) { // 매치 정보가 없는 경우, 매칭 Dialog 띄우기.
    return (
        <div className=" flex items-center -z-49 justify-center h-screen">
          <GameMatchingDialog
              myProfile={myProfile} setMyProfile={setMyProfile}
              myNickname={myNickname} setMyNickname={setMyNickname}
              enemyProfile={enemyProfile} setEnemyProfile={setEnemyProfile}
              enemyNickname={enemyNickname} setEnemyNickname={setEnemyNickname}
              setMatchData={setMatchData}/>
        </div>
    );
  } else { // 게임 매치 정보가 정해진 경우 (게임 시작, 게임 결과)
    return (
        <div>
          {/* 게임 렌더링 */}
          { !matchResult &&
              <div className=" absolute -z-50 w-0 h-0">
                <Renderer3D playerData={playerData} matchData={matchData} width={window.innerWidth} height={window.innerHeight} />
              </div>
          }

          {/* 게임 결과 */}
          { matchResult &&
              <Dialog
                  open={!!matchResult}
                  onClose={handleMatchResultDialogClose}
                  aria-labelledby="Match Result"
                  aria-describedby="match Result description"
              >
                <DialogTitle id="alert-dialog-title">
                  { 'Match Result' }
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
                      <Typography display="block" variant="h5" color="text.primary"> {myNickname} </Typography>
                      { (matchData.playerLocation !== gameType.PlayerLocation.OBSERVER) ? (
                          <div> {/* Player */}
                            <Typography display="block" variant="h3" color="text.primary"> {(matchResult.leftPlayerId === loggedUserId) ? matchResult.leftScore : matchResult.rightScore} </Typography>A
                          </div>
                        ) : (
                          <div> {/* Observer */}
                            <Typography display="block" variant="h3" color="text.primary"> {matchResult.leftScore} </Typography>
                          </div>)
                      }
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
                      { (matchData.playerLocation !== gameType.PlayerLocation.OBSERVER) ? (
                          <div> {/* Player */}
                            <Typography display="block" variant="h3" color="text.primary"> {(matchResult.leftPlayerId === loggedUserId) ? matchResult.leftScore : matchResult.rightScore} </Typography>A
                          </div>
                      ) : (
                          <div> {/* Observer */}
                            <Typography display="block" variant="h3" color="text.primary"> {matchResult.leftScore} </Typography>
                          </div>)
                      }
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
  }
};

export default React.memo(Game);