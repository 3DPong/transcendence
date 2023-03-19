import { Room } from "@/types/chat";
import { Box, ListItem, ListItemButton, Skeleton } from "@mui/material";
import React from "react";
import { FC } from "react";
import { FixedSizeList } from "react-window";
import ChatCard from "./ChatCard";
import clsx from "clsx";

interface ChatListProps {
  rooms: Room[];
  isLoading: boolean;
  isLocal: boolean;
};

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    isLoading: boolean;
    isLocal: boolean;
    chats: Room[];
  }
}

const Row : FC<RowProps> = ({index, style, data}) => {
  const room = data.chats[index];
  const { isLoading, isLocal } = data;

  return (
    <Box
      key={index}
      className={clsx(
        "flex items-center justify-start gap-2",
        index % 2 === 0 ? "bg-white" : "bg-gray-50",
        "p-4"
      )}
      style={style}
    >
      <ChatCard room={room} isLoading={isLoading} isLocal={isLocal}/>
    </Box>
  );
};


const VirtualizedChatList: FC<ChatListProps> = ({rooms, isLoading, isLocal}) => {
  const renderRooms : Room[] = (
    isLoading ?
      Array.from({length: 5}, (_, index) => ({
        channelId : index,
        channelName : "",
        channelType : "public",
        owner: {userId: 1, profile:"", nickname: "" }
      }))
      : rooms
    );

  return (
    <div>
      {
        <Box
          sx={{
              width: "100%",
              height: 400,
              maxWidth: 360,
              bgcolor: "background.paper",
          }}
        >
          <FixedSizeList
            height={400}
            width="100%"
            itemSize={60}
            itemCount={ renderRooms.length }
            overscanCount={5}
            itemData={ { chats : renderRooms, isLoading : isLoading, isLocal : isLocal} }
            // Scrollbar css
            className=" scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
          >
            {Row}
          </FixedSizeList>
        </Box>
      }
    </div>
  );
};

export default VirtualizedChatList;