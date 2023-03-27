import { ChannelType, Channel } from "@/types/chat";
import { Box } from "@mui/material";
import React from "react";
import { FC } from "react";
import { FixedSizeList } from "react-window";
import ChannelCard from "./ChannelCard";
import clsx from "clsx";

interface ChannelListProps {
  channels: Channel[];
  isLoading: boolean;
  handleCardClick: (id: number, type: ChannelType) => void;
};

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    isLoading: boolean;
    chats: Channel[];
    handleCardClick: (id: number, type: ChannelType) => void;
  }
}

const Row : FC<RowProps> = ({index, style, data}) => {
  const channel = data.chats[index];

  return (
    <Box
      key={channel.id}
      className={clsx(
        "flex items-center justify-start gap-2",
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      )}
      style={style}
    >
      <ChannelCard channel={channel} isLoading={data.isLoading} handleCardClick={data.handleCardClick}/>
    </Box>
  );
};


const VirtualizedChannelList: FC<ChannelListProps> = ({channels, isLoading, handleCardClick}) => {
  const renderChannels : Channel[] = (
    isLoading ?
      Array.from({length: 5}, (_, index) => ({
        id: index,
        title: "",
        type: "public",
        owner: {id: 1, profile:"", nickname: "" }
      }))
      : channels
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
            itemCount={ renderChannels.length }
            overscanCount={5}
            itemData={ { chats : renderChannels, isLoading : isLoading, handleCardClick : handleCardClick } }
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

export default VirtualizedChannelList;