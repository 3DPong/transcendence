import React from 'react';
import { IconButton, Typography } from '@mui/material';
import { ArrowBack, Public, Lock, LockOpen, Person, Menu } from '@mui/icons-material';
import { Room, User } from '@/types/chat';
import { Link } from 'react-router-dom';

interface Props {
  room: Room;
  users: {[k: string]: User};
  onMenuClick?: () => void;
}

const MessageHeader: React.FC<Props> = ({ room, users, onMenuClick }) => {

  const memberCount = Object.keys(users).length;

  const getChatTypeIcon = () => {
    switch (room.channelType) {
      case 'protected':
        return <Lock fontSize="small" />;
      case 'private':
        return <LockOpen fontSize="small" />;
      case 'public':
        return <Public fontSize="small" />;
      case 'dm':
        return <Person fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <div className=" p-2 pl-4 pr-4 border border-gray-200 flex items-center">
      <IconButton component={Link} to={"/rooms"} edge="start" color="inherit" aria-label="back">
        <ArrowBack />
      </IconButton>
      <div className="flex-grow flex items-center justify-center">
        <div className="flex items-center">
          <span className="px-1.5 py-0.5 rounded text-blue-700 pr-2">
            {getChatTypeIcon()}
          </span>
          <Typography
            variant="h6"
            title={room.channelName}
            className="underline bold text-black-700 text-center
                        truncate overflow-ellipsis overflow-hidden
                        max-w-[220px] min-w-[100px]">
            {room.channelName}
          </Typography>
        </div>
        <Typography variant="subtitle1" className="pl-2 text-gray-700">
          {memberCount > 99 ? '99+' : memberCount}
        </Typography>
      </div>
      <IconButton edge="end" color="inherit" aria-label="menu" onClick={onMenuClick}>
        <Menu />
      </IconButton>
    </div>
  );
};

export default MessageHeader;