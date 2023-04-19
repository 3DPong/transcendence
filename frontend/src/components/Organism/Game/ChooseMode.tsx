import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useSocket } from '@/context/SocketContext';
import { useContext } from 'react';
import GlobalContext from '@/context/GlobalContext';
import { Assert } from '@/utils/Assert';
import { gameType, MatchJoinData, roomType } from '@/types/game';
import { useError } from '@/context/ErrorContext';

// https://mui.com/material-ui/react-button/
const images = [
  {
    url: 'https://www.gamespot.com/a/uploads/original/1592/15920003/3670936-nda%20_5_14_9_am_pt%20kartrider%20drift%2011.png',
    title: 'Normal',
    width: '50%',
  },
  {
    url: 'https://mmoculture.com/wp-content/uploads/2019/04/Crazy-Racing-KartRider.jpg',
    title: 'Special',
    width: '50%',
  },
];

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: 200,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important', // Overrides inline-style
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
});

const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
}));

const ImageMarked = styled('span')(({ theme }) => ({
  height: 3,
  width: 18,
  backgroundColor: theme.palette.common.white,
  position: 'absolute',
  bottom: -2,
  left: 'calc(50% - 9px)',
  transition: theme.transitions.create('opacity'),
}));

interface ChooseModeButtonProps {
  // handleClose: () => void;
  setIsModeSelected: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChooseModeButton({ setIsModeSelected }: ChooseModeButtonProps) {
  const { gameSocket } = useSocket();
  const { handleError } = useError();
  const { loggedUserId } = useContext(GlobalContext);
  const handleNormalModeClick = () => {
    if (!gameSocket) {
      handleError('gameSocket', 'gameSocket is currently null', '/');
      return;
    }
    console.log('NormalMode selected');
    const matchJoinData: MatchJoinData = {
      roomType: roomType.random,
      gameType: gameType.normal,
    };
    gameSocket.emit('matchJoin', matchJoinData);
    setIsModeSelected(true);
  };
  const handleSpecialModeClick = () => {
    if (!gameSocket) {
      handleError('gameSocket', 'gameSocket is currently null', '/');
      return;
    }
    Assert.NonNullish(loggedUserId, 'UserId is null');
    console.log('SpecialMode selected');
    console.log(loggedUserId);
    const matchJoinData: MatchJoinData = {
      roomType: roomType.random,
      gameType: gameType.special,
    };
    gameSocket.emit('matchJoin', matchJoinData);
    setIsModeSelected(true);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%' }}>
      {images.map((image, idx) => (
        <ImageButton
          onClick={() => {
            if (idx === 0) {
              handleNormalModeClick();
            } else if (idx === 1) {
              handleSpecialModeClick();
            }
          }}
          focusRipple
          key={image.title}
          style={{
            width: image.width,
          }}
        >
          <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
          <ImageBackdrop className="MuiImageBackdrop-root" />
          <Image>
            <Typography
              component="span"
              variant="subtitle1"
              color="inherit"
              sx={{
                position: 'relative',
                p: 4,
                pt: 2,
                pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
              }}
            >
              {image.title}
              <ImageMarked className="MuiImageMarked-root" />
            </Typography>
          </Image>
        </ImageButton>
      ))}
    </Box>
  );
}
