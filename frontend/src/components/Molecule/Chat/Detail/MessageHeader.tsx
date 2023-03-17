import React from 'react';
import { IconButton, Typography } from '@mui/material';
import { ArrowBack, Public, Lock, LockOpen, Person, Menu } from '@mui/icons-material';
import { Room, User } from '@/types/chat';

interface Props {
  room: Room;
  users: {[k: string]: User};
  onMenuClick?: () => void;
}

const MessageHeader: React.FC<Props> = ({ room, users, onMenuClick }) => {

  const memberCount = Object.keys(users).length;

  const chatTypeIcon = () => {
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
    <div className="flex items-center p-2 border-b border-gray-200">
      <IconButton edge="start" color="inherit" aria-label="back">
        <ArrowBack />
      </IconButton>
      <div className="flex-grow flex items-center justify-center">
        <div className="flex items-center">
          <span className="px-1 bg-blue-200 rounded text-blue-700">
            {chatTypeIcon()}
          </span>
          <Typography variant="h6" className="ml-2 text-purple-700">
            {room.channelName}
          </Typography>
        </div>
        <Typography variant="subtitle1" className="ml-4 text-green-700">
          {memberCount}
        </Typography>
      </div>
      <IconButton edge="end" color="inherit" aria-label="menu">
        <Menu />
      </IconButton>
    </div>
  );
};

export default MessageHeader;