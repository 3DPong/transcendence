import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@mui/material';
import { SportsEsports } from '@mui/icons-material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface BattleRequestModalProps {
  open: boolean;
  onClose: () => void;
  onGameCreate: (gameType: string) => void;
}

const BattleRequestModal: React.FC<BattleRequestModalProps> = ({ open, onClose, onGameCreate }) => {
  const [gameType, setGameType] = useState('normal');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGameType(event.target.value);
  };

  const handleGameCreate = () => {
    onGameCreate(gameType);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>배틀 신청</DialogTitle>
      <DialogContent>
        <RadioGroup row aria-label="gameType" name="gameType" value={gameType} onChange={handleChange}>
          <FormControlLabel
            value="normal"
            control={
              <Radio
                icon={
                  <IconButton color="default" aria-label="normal game">
                    <SportsEsports />
                  </IconButton>
                }
                checkedIcon={
                  <IconButton color="primary" aria-label="normal game">
                    <SportsEsports />
                  </IconButton>
                }
              />
            }
            label="일반전"
            labelPlacement="bottom"
          />
          <FormControlLabel
            value="item"
            control={
              <Radio
                icon={
                  <IconButton color="default" aria-label="item game">
                    <RocketLaunchIcon />
                  </IconButton>
                }
                checkedIcon={
                  <IconButton color="primary" aria-label="item game">
                    <RocketLaunchIcon />
                  </IconButton>
                }
              />
            }
            label="아이템전"
            labelPlacement="bottom"
          />
        </RadioGroup>
        <Button fullWidth variant="contained" color="primary" onClick={handleGameCreate} className="mt-4">
          게임 생성
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BattleRequestModal;
