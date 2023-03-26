import React, { FC } from "react";
import { Box, ListItemButton, Skeleton } from "@mui/material";
import { ChatType, Room } from "@/types/chat";
import { Lock, LockOpen, Public, Sms } from "@mui/icons-material";

interface ChatCardProps {
  room: Room;
  isLoading: boolean;
  handleCardClick: (id: number, type: ChatType) => void;
};

interface LoadedCardProps {
  room: Room;
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

const LoadedCard : FC<LoadedCardProps> = ({room}) => {
  function getIcon(type: ChatType) {
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
        src={room.thumbnail || "https://pbs.twimg.com/profile_images/859429610248863744/mg7H1c7u_400x400.jpg"}
        alt="thumbnail"
        className="w-12 h-12 rounded-full"
      />
      <div className="flex flex-col pl-2">
        <span
          className="text-md font-medium overflow-hidden whitespace-nowrap text-ellipsis"
          style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180}}>
          {room.channelName}
        </span>
        <span className="text-gray-500">
          {getIcon(room.channelType)}  {room.channelType}
        </span>
      </div>
    </>
  );
};

const ChatCard : FC<ChatCardProps> = ({room, isLoading, handleCardClick}) => {
  return (
    isLoading ?
    <ListItemButton disabled>
      <SkeletonCard />
    </ListItemButton>
    :
    <ListItemButton title={room.channelName} onClick={() => handleCardClick(room.channelId, room.channelType)}>
      <LoadedCard room={room} />
    </ListItemButton>
  );
}

export default ChatCard;