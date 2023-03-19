import React, { FC } from "react";
import { Box, Skeleton } from "@mui/material";
import { ChatType, Room } from "@/types/chat";
import { Lock, LockOpen, Public } from "@mui/icons-material";

interface ChatCardProps {
  room: Room;
  isLoading?: boolean;
  isLocal?: boolean;
};

const SkeletonCard : React.FunctionComponent = () => {
  return (
    <>
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="text" width={200} height={24} />
    </>
  );
};

const LoadedCard : FC<ChatCardProps> = ({room}) => {
  function getIcon(type: ChatType) {
    switch(type){
    case "public":
      return <Public />;
    case "protected":
      return <LockOpen />;
    case "private":
      return <Lock />;
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
      <div className="flex flex-col">
        <span className="text-md font-medium">{room.channelName}</span>
        <span className="text-gray-500">{getIcon(room.channelType)}  {room.channelType}</span>
      </div>
    </>
  );
};

const ChatCard : FC<ChatCardProps> = ({room, isLoading, isLocal}) => {
  return (
    isLoading ? <SkeletonCard /> :
    isLocal ? <LoadedCard room={room} /> : <LoadedCard room={room} />
  );
}

export default ChatCard;