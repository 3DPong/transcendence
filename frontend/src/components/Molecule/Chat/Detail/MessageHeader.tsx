import React from 'react';
import { IconButton, Typography } from '@mui/material';
import { ArrowBack, Public, Lock, LockOpen, Person, Menu } from '@mui/icons-material';
import { Channel, ChannelType } from '@/types/chat';
import { Link } from 'react-router-dom';

interface MessageHeaderProps {
  channel: Channel;
  memberCount: number;
  handleMenuButton: () => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ channel, memberCount, handleMenuButton }) => {
  const getChannelTypeIcon = (type: ChannelType) => {
    switch (type) {
      case 'protected':
        return <LockOpen fontSize="small" />;
      case 'private':
        return <Lock fontSize="small" />;
      case 'public':
        return <Public fontSize="small" />;
      case 'dm':
        return <Person fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <div className=" flex-shrink-0 p-2 pl-4 pr-4 border border-gray-200 flex items-center">
      <IconButton component={Link} to={'/channels'} edge="start" color="inherit" aria-label="back">
        <ArrowBack />
      </IconButton>
      <div className="flex-grow flex items-center justify-center">
        <div className="flex items-center">
          <span className="px-1.5 py-0.5 rounded text-blue-700 pr-2">{getChannelTypeIcon(channel.type)}</span>
          <Typography
            variant="h6"
            title={channel.title}
            className="underline bold text-black-700 text-center
                        truncate overflow-ellipsis overflow-hidden
                        max-w-[220px] min-w-[100px]"
            style={{ whiteSpace: 'pre' }}
          >
            {channel.title}
          </Typography>
        </div>
        <Typography variant="subtitle1" className="pl-2 text-gray-700">
          {memberCount > 99 ? '99+' : memberCount}
        </Typography>
      </div>
      <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleMenuButton}>
        <Menu />
      </IconButton>
    </div>
  );
};

export default MessageHeader;
