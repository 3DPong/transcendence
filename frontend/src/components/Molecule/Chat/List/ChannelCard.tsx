import React, { FC } from "react";
import { Box, ListItemButton, Skeleton } from "@mui/material";
import { ChannelType, Channel, defaultThumbnail } from "@/types/chat";
import { Lock, LockOpen, Public, Sms } from "@mui/icons-material";
import { RiVipCrown2Fill } from 'react-icons/ri';

interface ChannelCardProps {
  channel: Channel;
  isLoading: boolean;
  handleCardClick: (id: number, type: ChannelType) => void;
};

interface LoadedCardProps {
  channel: Channel;
}

const SkeletonCard : React.FunctionComponent = () => {
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

const LoadedCard : FC<LoadedCardProps> = ({channel}) => {
  function getIcon(type: ChannelType) {
    switch(type){
    case "public":
      return <Public />;
    case "protected":
      return <LockOpen />;
    case "private":
      return <Lock />;
    case "dm":
      return <Sms />;
    default:
      return;
    }
  };

  return (
  <>
    <img
      src={channel.thumbnail || defaultThumbnail}
      alt="thumbnail"
      className="w-12 h-12 rounded-full"
    />
    <div className="flex flex-col pl-2 pr-2 w-full">
      <span
        className="text-md font-medium overflow-hidden whitespace-nowrap text-ellipsis"
        style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180}}>
        {channel.type === "dm" ? channel.owner.nickname + "님 과의 DM" : channel.title}
      </span>
      <div className="text-gray-500 flex items-center w-full">
        <div style={{width: '50%'}}>
          {getIcon(channel.type)} {channel.type}
        </div>
        <div style={{width: '50%'}} className="flex items-center half-width justify-start">
          <RiVipCrown2Fill size="1.2em" color="Blue" style={{paddingRight: '4px'}}/>
          <span
            style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70}}>
            {channel.owner.nickname}
          </span>
        </div>
      </div>
    </div>
  </>
  );
};

const ChannelCard : FC<ChannelCardProps> = ({channel, isLoading, handleCardClick}) => {
  return (
    isLoading ?
    <ListItemButton disabled>
      <SkeletonCard />
    </ListItemButton>
    :
    <ListItemButton title={channel.title} onClick={() => handleCardClick(channel.id, channel.type)}>
      <LoadedCard channel={channel} />
    </ListItemButton>
  );
}

export default ChannelCard;