import { Room } from "@/types/chat";
import { Box, ListItemButton } from "@mui/material";
import { CSSProperties } from "@mui/styled-engine";
import React from "react";
import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { FixedSizeList } from "react-window";
import ChatCard from "./ChatCard";

interface ChatListProps {
  chats: Room[];
  isLoading: boolean;
};

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    chats: Room[];
  }
}


const Row : FC<RowProps> = ({index, style, data}) => {
  const chat = data.chats[index];

  return (
    <ListItemButton component={Link} to={"/rooms/"+chat.channelId} style={style} key={index} divider={true}>
      <ChatCard
        imgURL={chat.thumbnail}
        chat={chat}
      />
    </ListItemButton>
  );
}

const VirtualizedChatList: FC<ChatListProps> = ({chats}) => {

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
            itemCount={ chats.length }
            overscanCount={5}
            itemData={ { chats : chats} }
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