import React, {FC, useContext, useState} from "react";
import SearchTextField from "@/components/Molecule/SearchTextField";
import MediaCard from "@/components/Molecule/MediaCard";

import VirtualizedChatList from '@/components/Molecule/Chat/List/ChannelList'
import { ChannelType, Channel } from "@/types/chat";
import * as Dummy from "@/dummy/data";
import EnterProtectedModal from "@/components/Molecule/Chat/List/EnterProtectedModal";

import GlobalContext from "@/context/GlobalContext";


interface ChatListProps {
};

const GlobalChatList : FC<ChatListProps> = () => {
  const [globalChats, setGlobalChats] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>("");
 
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectChat, setSelectChat] = useState<Channel>();

  const {channels, setChannels} = useContext(GlobalContext);

  function searchButtonClick() {
    setIsLoading(true);
    setTimeout(() => {
      setGlobalChats(Dummy.dummy_globalchatrooms);
      setIsLoading(false);
    }, 2000);
  }

  function searchButtonKeyup(event: React.KeyboardEvent) {
    if (event.key === 'Enter')
      searchButtonClick();
  }

  function joinChat(id:number) {
    const channel = globalChats.find((channel)=>(channel.id) === id);
    setGlobalChats(globalChats.filter((channel)=>(channel.id !== id)))
    if (channel) {
      console.log(channel.title);
      setChannels([channel, ...channels]);
    }
  }

  function handleCardClick(id: number, type: ChannelType) {
    if (type === "protected") {
      setPasswordModalOpen(true);
      setSelectChat(globalChats.find((chat) => (chat.id === id)));
    } else {
      joinChat(id);
    }
  }
  
  return (
    <>
      <MediaCard
        imageUrl="https://cdn.dribbble.com/userupload/4239195/file/original-6b394022fdad0c9e88cf347bf38220be.png?compress=1&resize=640x480&vertical=top"
        title="Public Channels"
        body="body2 text"
      />

      <div className=" border m-0 p-4">
        <SearchTextField
          state={searchString}
          setState={setSearchString}
          onClick={searchButtonClick}
          onKeyUp={searchButtonKeyup}
          placeholder={"공개 채팅방 검색"}
        />
      </div>

      <VirtualizedChatList channels={globalChats} isLoading={isLoading} handleCardClick={handleCardClick} />

      <EnterProtectedModal channel={selectChat} isModalOpen={passwordModalOpen} setIsModalOpen={setPasswordModalOpen} joinChat={joinChat} />
    </>
  );
}

export default GlobalChatList;