import React, { FC } from 'react';
import { Badge, Box, ListItemButton, Skeleton } from '@mui/material';
import { ChannelType, Channel, defaultThumbnail } from '@/types/chat';
import { Lock, LockOpen, Person, Public, Sms } from '@mui/icons-material';
import { RiVipCrown2Fill } from 'react-icons/ri';
import { BsFillPersonFill } from 'react-icons/bs';

interface ChannelCardProps {
  channel: Channel;
  isLoading: boolean;
  handleCardClick: (id: number, type: ChannelType) => void;
}

interface LoadedCardProps {
  channel: Channel;
}

const SkeletonCard: React.FunctionComponent = () => {
  return (
    <>
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex flex-col pl-2">
        <Skeleton variant="text" width={180} height={24} />
        <Skeleton variant="text" width={80} height={20} />
      </div>
    </>
  );
};

const LoadedCard: FC<LoadedCardProps> = ({ channel }) => {
  function getIcon(type: ChannelType) {
    switch (type) {
      case 'public':
        return <Public />;
      case 'protected':
        return <LockOpen />;
      case 'private':
        return <Lock />;
      case 'dm':
        return <Sms />;
      default:
        return;
    }
  }

  // 안읽은 메시지 카운트용
  const count = 0;

  return (
    <>
      {channel.thumbnail ? (
        <img
          src={channel.thumbnail}
          alt="thumbnail"
          className="w-12 h-12 rounded-full relative"
          style={{ border: '2px solid gray', minWidth: '48px' }}
        />
      ) : (
        <div
        className="rounded-full flex justify-center items-center relative"
        style={{ width: '48px', height: '48px', border: '2px solid gray',  minWidth: '48px' }}
      >
        <BsFillPersonFill className="w-6 h-6" />
      </div>
      )}
      <div className="flex flex-col pl-2 pr-2 w-full">
        <div className="flex items-center justify-between">
          <span
            className="text-md font-medium overflow-hidden whitespace-nowrap text-ellipsis"
            style={{ textOverflow: 'ellipsis', whiteSpace: 'pre', maxWidth: count ? 160 : 180 }}
          >
            {channel.title}
          </span>
          {count > 0 && (
            <Badge badgeContent={count} color="error">
              <Box sx={{ ml: 1 }} />
            </Badge>
          )}
        </div>
        <div className="text-gray-500 flex items-center w-full">
          <div style={{ width: '55%' }}>
            {getIcon(channel.type)} {channel.type}
          </div>
          <div style={{ width: '45%' }} className="flex items-center half-width justify-start">
            {channel.type === 'dm' ? (
              <Person fontSize="small" />
            ) : (
              <RiVipCrown2Fill size="1.2em" color="Blue" style={{ paddingRight: '4px' }} />
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 60 }}>
              {channel.owner.nickname}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const ChannelCard: FC<ChannelCardProps> = ({ channel, isLoading, handleCardClick }) => {
  return isLoading ? (
    <ListItemButton disabled>
      <SkeletonCard />
    </ListItemButton>
  ) : (
    <ListItemButton
      title={channel.type === 'dm' ? channel.owner.nickname + '님 과의 DM' : channel.title}
      onClick={() => handleCardClick(channel.id, channel.type)}
    >
      <LoadedCard channel={channel} />
    </ListItemButton>
  );
};

export default ChannelCard;
