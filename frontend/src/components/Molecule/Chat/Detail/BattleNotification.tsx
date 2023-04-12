// src/BattleNotification.tsx

import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinearProgress from '@mui/material/LinearProgress';

interface BattleNotificationProps {
  onClose: () => void;
}

const BattleNotification: React.FC<BattleNotificationProps> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState(10000);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 10);
    }, 10);

    if (timeLeft === 0) {
      onClose();
    }

    return () => clearTimeout(timer);
  }, [timeLeft, onClose]);

  return (
    <div
      className="relative bg-red-500 border border-solid border-red-700 rounded pl-6 p-2 mb-4"
      style={{ zIndex: 9999 }}
    >
      <div className="flex justify-between">
        <div className="text-white">
          <p className="font-bold">XX 님의 아이템전 배틀신청</p>
          <p>게임하실분~~</p>
        </div>
        <CloseIcon onClick={onClose} className="cursor-pointer text-white" />
      </div>
      <div className="mt-2 flex justify-between items-center">
        <Button variant="contained" color="primary" className="mr-2">
          참여하기
        </Button>
        <Button variant="outlined" color="primary">
          관전하기
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <LinearProgress
          variant="determinate"
          value={((10000 - timeLeft) / 10000) * 100}
          color="secondary"
          style={{ height: '4px' }}
        />
      </div>
    </div>
  );
};

export default BattleNotification;
