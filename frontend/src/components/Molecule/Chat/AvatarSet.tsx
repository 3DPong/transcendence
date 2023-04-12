import { ChatUser, UserStatus } from '@/types/chat';
import { Avatar, Badge, Box } from '@mui/material';
import { FC, ReactNode, useState } from 'react';
import AvatarPopper from './AvatarPopper';
import { styled } from '@mui/material/styles';
import { RiVipCrown2Fill } from 'react-icons/ri';

const getBadgeColor = (status: UserStatus = 'none') => {
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

const StyledBadge = styled(Badge)<{ status: UserStatus }>(({ status = 'none', theme }) => ({
  '& .MuiBadge-badge': {
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
      animation: ['online', 'ingame'].includes(status) ? 'ripple 1.2s infinite ease-in-out' : 'none',
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

interface AvatarBadgeProps {
  user: ChatUser;
  children: ReactNode;
  isNone: boolean;
}

const AvatarBadge: FC<AvatarBadgeProps> = ({ user, children, isNone }) => {
  return (
    <Badge
      sx={{ paddingLeft: '6px', paddingRight: '2px', zIndex: 2 }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      overlap="circular"
      badgeContent={
        ['owner', 'admin'].includes(user.role) ? (
          <RiVipCrown2Fill size="1.5em" color={user.role === 'owner' ? 'Blue' : 'Crimson'} />
        ) : (
          <></>
        )
      }
    >
      {isNone ? (
        <Box>{children}</Box>
      ) : (
        <StyledBadge
          status={user.status || 'none'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {children}
        </StyledBadge>
      )}
    </Badge>
  );
};

interface AvatarSetProps {
  user: ChatUser;
  scrollY: number;
}

const AvatarSet: FC<AvatarSetProps> = ({ user, scrollY }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isNone = user.status === 'none';

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <AvatarBadge user={user} isNone={isNone}>
      <Avatar
        sx={{ border: '2px gray solid' }}
        src={user.profile}
        alt={user.nickname}
        className="cursor-pointer"
        onClick={handleAvatarClick}
      />
      {Boolean(anchorEl) && (
        <AvatarPopper
          anchorEl={anchorEl}
          handleClose={() => {
            setAnchorEl(null);
          }}
          target={user}
          scrollY={scrollY}
        />
      )}
    </AvatarBadge>
  );
};

export default AvatarSet;
