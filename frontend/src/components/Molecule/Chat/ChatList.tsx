import { ChatType, Room } from "@/types/chat";
import { Box } from "@mui/material";
import React from "react";
import { FC } from "react";
import { FixedSizeList } from "react-window";
import ChatCard from "./ChatCard";
import clsx from "clsx";

interface ChatListProps {
  rooms: Room[];
  isLoading: boolean;
  handleCardClick: (id: number, type: ChatType) => void;
};

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    isLoading: boolean;
    chats: Room[];
    handleCardClick: (id: number, type: ChatType) => void;
  }
}

const Row : FC<RowProps> = ({index, style, data}) => {
  const room = data.chats[index];

  return (
    <Box
      key={index}
      className={clsx(
        "flex items-center justify-start gap-2",
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      )}
      style={style}
    >
      <ChatCard room={room} isLoading={data.isLoading} handleCardClick={data.handleCardClick}/>
    </Box>
  );
};


const VirtualizedChatList: FC<ChatListProps> = ({rooms, isLoading, handleCardClick}) => {
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
            itemData={ { chats : renderRooms, isLoading : isLoading, handleCardClick : handleCardClick } }
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