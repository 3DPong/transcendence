import { ChatUser, UserStatus } from "@/types/chat";
import { Avatar, Badge } from "@mui/material";
import { FC, useState } from "react";
import AvatarPopper from "./AvatarPopper";
import { styled } from '@mui/material/styles';


const getBadgeColor = (status: UserStatus = "none") => {
  switch (status) {
    case 'online':
      return '#44b700';
    case 'offline':
      return '#808080';
    case 'ingame':
      return '#ff0000';
    case 'none':
      return '#ffffff';
    default:
      return '#808080';
  }
};

const StyledBadge = styled(Badge)<{ status: UserStatus }>(({ status = "none", theme }) => ({
  '& .MuiBadge-badge': {
    zindex: 2,
    backgroundColor: getBadgeColor(status),
    color: getBadgeColor(status),
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'offline' ? 'none' : 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

interface AvatarSetProps {
  user: ChatUser;
  scrollY: number;
};

const AvatarSet : FC<AvatarSetProps> = ({user, scrollY}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <StyledBadge
      status={user.status || 'none'}
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
    >
      <Avatar
          src={user.profile}
          alt={user.nickname}
          className="cursor-pointer"
          onClick={handleAvatarClick}
      />
      {Boolean(anchorEl) && <AvatarPopper
        anchorEl={anchorEl}
        handleClose={()=>{setAnchorEl(null);}}
        targetId={user.id}
        scrollY={scrollY}
      />
      }
    </StyledBadge>
  );
};

export default AvatarSet;