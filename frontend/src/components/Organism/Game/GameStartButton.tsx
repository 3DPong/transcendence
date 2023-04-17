import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ChooseModeButton from '@/components/Organism/Game/ChooseMode';
import * as gameType from '@/types/game';
import { useSocket } from '@/context/SocketContext';
import { Avatar, Box, Typography } from '@mui/material';
import { useError } from '@/context/ErrorContext';
import * as API from '@/api/API';
import { Assert } from '@/utils/Assert';
import { Skeleton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { green } from '@mui/material/colors';
import ClearIcon from '@mui/icons-material/Clear';
import {useNavigate} from "react-router";

// https://mui.com/material-ui/customization/color/

interface GameStartButtonProps {
  myProfile: string;
  setMyProfile: React.Dispatch<React.SetStateAction<string>>;
  myNickname: string;
  setMyNickname: React.Dispatch<React.SetStateAction<string>>;
  enemyProfile: string;
  setEnemyProfile: React.Dispatch<React.SetStateAction<string>>;
  enemyNickname: string;
  setEnemyNickname: React.Dispatch<React.SetStateAction<string>>;

  setMatchData: (matchData: gameType.matchStartData) => void;
}

export default function GameStartButton({
  setMatchData,
  myProfile,
  setMyProfile,
  myNickname,
  setMyNickname,
  enemyProfile,
  setEnemyProfile,
  enemyNickname,
  setEnemyNickname,
}: GameStartButtonProps) {
  const { gameSocket } = useSocket();
  // 모드 선택 dialog
  const [modeSelectDialogOpen, setModeSelectDialogOpen] = useState<boolean>(false);
  const [isModeSelected, setIsModeSelected] = useState<boolean>(false);
  // 매칭 로딩 dialog
  const [matchingDialogOpen, setMatchingDialogOpen] = useState<boolean>(false);
  const [isMatched, setIsMatched] = useState<boolean>(false);
  // 부모의 state을 set하기 전에, 데이터 임시 저장용 state. (로딩 된 이후 바로 게임 시작되는 것 방지)
  const [__matchDataCache, __setMatchDataCache] = useState<gameType.matchStartData>();
  // 로딩중 내 정보와 상대방 정보 보여주기 버튼.
  const { handleError } = useError();
  const navigate = useNavigate();

  const handleModeSelectDialogOpen = () => {
    setModeSelectDialogOpen(true);
  };

  const handleModeSelectDialogClose = () => {
    setModeSelectDialogOpen(false);
  };

  const handleMatchingDialogOpen = () => {
    setMatchingDialogOpen(true);
  };

  // https://stackoverflow.com/questions/57329278/how-to-handle-outside-click-on-dialog-modal
  const handleMatchingDialogClose = (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason && reason === 'backdropClick') return; // 외곽 영역 클릭시 꺼지지 않도록 설정.
    setMatchingDialogOpen(false);
  };

  const handleProgressFinish = () => {
    Assert.NonNullish(__matchDataCache, '__matchDataCache is null');
    console.log("[DEV] handleProgressFinish")
    setMatchData(__matchDataCache);
  };

  // ---------------------------------------
  // 첫 렌더시 소켓 이벤트 등록, 사용자 정보 로드
  useEffect(() => {
    // (1) 사용자 데이터 로드
    (async () => {
      console.log('[DEV] 사용자의 세팅을 불러오는 중입니다.');
      const loadedSettings = await API.getMySettings(handleError, navigate);
      if (loadedSettings) {
        console.log(loadedSettings);
        setMyProfile(loadedSettings.profile_url);
        setMyNickname(loadedSettings.nickname);
      }
    })(/* IIFE */);
  }, []);
  // ---------------------------------------

  useEffect(() => {
    if (!gameSocket) return;
    // (2) Match가 성사되어 SceneData를 전달받음. 이를 이용해서 게임 로딩.
    function onSceneReady(matchStartData: gameType.matchStartData) {
      setIsMatched(true);
      __setMatchDataCache(matchStartData);
    }
    gameSocket.on('onSceneReady', onSceneReady);
    return () => {
      gameSocket.off('onSceneReady', onSceneReady);
    };
  }, [gameSocket]);

  // ---------------------------------------
  // 모드 선택이 됬다면 해당 Dialog 종료.
  useEffect(() => {
    if (!isModeSelected) return;
    if (!gameSocket) {
      handleError('gameSocket', 'gameSocket is currently null', '/');
      return;
    }
    // 모드 선택이 된 경우 이미 socket으로 emit한 상태임. (ChooseMode 버튼 내부에서 처리함)
    handleModeSelectDialogClose(); // 모드 선택 종료.
    handleMatchingDialogOpen(); // 매칭 시작.
    // 따라서 그냥 Dialog 교체만 해주면 됨.
  }, [isModeSelected]);
  // ---------------------------------------

  // ---------------------------------------
  // 매칭 데이터 캐싱 완료, 적의 프로필 정보 보여주기.
  useEffect(() => {
    if (!__matchDataCache) return;
    (async () => {
      console.log('[DEV] 대결 상대의 프로필을 불러오는 중입니다.');
      const loadedSettings = await API.getUserDataById(handleError, __matchDataCache.enemyUserId);
      if (loadedSettings) {
        console.log(loadedSettings);
        setEnemyProfile(loadedSettings.profile_url);
        setEnemyNickname(loadedSettings.nickname);
      }
    })(/* IIFE */);
    // ...
  }, [__matchDataCache]);

  // ---------------------------------------
  // 매칭 취소 버튼
  const [cancelMatching, setCancelMatching] = useState<boolean>(false);
  const handleMatchingCancel = () => {
    setCancelMatching(true);
  };

  useEffect(() => {
    if (!cancelMatching) return;
    if (!gameSocket) {
      handleError('gameSocket', 'gameSocket is currently null', '/');
      return;
    }
    console.log('매칭이 취소되었습니다.');
    gameSocket.emit('exit');
    handleMatchingDialogClose();
    setCancelMatching(false); // 초기화
    setIsModeSelected(false); // 초기화
  }, [cancelMatching]);
  // ---------------------------------------

  return (
    <div>
      {/* ------------------ 랜덤 매칭 시작 버튼 ------------------------------- */}
      <Button variant="contained" onClick={handleModeSelectDialogOpen}>
        Random Match
      </Button>

      {/* ------------------ 게임 모드 선택 Dialog ------------------------------- */}
      <Dialog
        open={modeSelectDialogOpen}
        onClose={handleModeSelectDialogClose}
        aria-labelledby="select game mode"
        aria-describedby="select game mode"
        PaperProps={{ sx: { width: '50%' } }}
      >
        <DialogTitle id="title">{'Choose Game Mode'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="description">게임 모드 선택에 대한 설명.</DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* 게임 모드 선택 팝업 (socket.emit) */}
          <ChooseModeButton setIsModeSelected={setIsModeSelected} />
        </DialogActions>
      </Dialog>
      {/* // Mode select */}

      {/* ------------------- 게임 매칭중 Dialog ---------------------------------- */}
      <Dialog open={matchingDialogOpen} onClose={handleMatchingDialogClose}>
        {/*  */}
        <DialogTitle align="center" id="title">
          {isMatched ? '🎉매칭 성공!' : '대결상대 매칭중...'}
        </DialogTitle>

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {/* (1) 내 프로필 정보 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 4 }}>
            <Box sx={{ m: 1, position: 'relative' }}>
              {myProfile && myNickname ? (
                <Avatar
                  alt="me"
                  src={myProfile}
                  sx={{
                    width: '150px',
                    height: '150px',
                  }}
                />
              ) : (
                <Skeleton variant="circular" animation="wave" width="100%" height="100%" />
              )}
            </Box>
            <Box sx={{ m: 1, position: 'relative' }}>
              <Typography display="block" variant="h5" color="text.primary">
                {myNickname}
              </Typography>
            </Box>
          </Box>

          {/* Versus */}
          <Typography display="block" variant="h3" color="text.primary">
            VS
          </Typography>

          {/* (2) 상대방 프로필 정보 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 4 }}>
            <Box sx={{ m: 1, position: 'relative' }}>
              {/* 매치가 성사됬을 때 상대방 아이콘. */}
              {isMatched ? (
                <Avatar
                  alt="enemy"
                  src={enemyProfile}
                  sx={{
                    width: '150px',
                    height: '150px',
                  }}
                />
              ) : (
                <div>
                  {/* 매칭중일 경우 물음표 아이콘 여기 집어넣기. */}
                  <Avatar
                    sx={{
                      width: '150px',
                      height: '150px',
                    }}
                  ></Avatar>
                  <CircularProgress
                    size={158}
                    thickness={2.0}
                    sx={{
                      color: green[500],
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      zIndex: 1,
                    }}
                  />
                </div>
              )}
            </Box>
            <Box sx={{ m: 1, position: 'relative' }}>
              <Typography display="block" variant="h5" color="text.primary">
                {enemyNickname || '???'}
              </Typography>
            </Box>
          </Box>
        </Box>
        {/*  */}

        {/* 매칭이 완료되었을 때 상대방 프로필을 보여줌과 동시에 몇초간 로딩바 띄워줌,
        차라리 로딩이 끝나고 카메라 전환이 끝나고 나서 보여주면 안되나?*/}
        {/* 매칭이 되지 않았을 때 취소하기 버튼 보여주기 */}
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', m: 4 }}>
          {isMatched ? (
            <Counter onFinish={handleProgressFinish} />
          ) : (
            <Button color="error" variant="contained" endIcon={<ClearIcon />} onClick={handleMatchingCancel}>
              매칭 취소하기
            </Button>
          )}
        </Box>
      </Dialog>
    </div>
  );
}

interface CounterProps {
  onFinish: () => void;
}
function Counter({ onFinish }: CounterProps) {
  const [count, setCount] = useState<number>(3);
  // const [isDone, setIsDone] = useState<boolean>(false);
  const [loopId, setLoopId] = useState<number>()

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          setLoopId(timer);
          return 3;
        }
        return (prevCount - 1);
      })
    }, 1000);

    // return () => {
      // clearInterval(timer);
    // };
  }, []);

  useEffect(() => {
    if (!loopId) return;
    clearInterval(loopId);
    onFinish();
  }, [loopId]);

  return (
    <Box sx={{ width: '100%', height: '5' }}>
      {'잠시 후 게임이 시작됩니다!'}
      <Typography display="block" variant="h5" color="text.primary">
        {count}
      </Typography>
    </Box>
  );
}
