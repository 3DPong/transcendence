import React, {FC, useContext, useEffect, useState} from "react";
import SearchTextField from "@/components/Molecule/SearchTextField";
import MediaCard from "@/components/Molecule/MediaCard";

import VirtualizedChatList from '@/components/Molecule/Chat/ChatList'
import { ChatType, Room } from "@/types/chat";
import * as Dummy from "@/dummy/data";
import EnterProtectedModal from "@/components/Molecule/Chat/EnterProtectedModal";

import GlobalContext from "@/context/GlobalContext";


interface ChatListProps {
};

const GlobalChatList : FC<ChatListProps> = () => {
  const [globalChats, setGlobalChats] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>("");
 
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectChat, setSelectChat] = useState<Room>();

  const {rooms, setRooms} = useContext(GlobalContext);

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
    const chat = globalChats.find((chat)=>(chat.channelId) === id);
    setGlobalChats(globalChats.filter((chat)=>(chat.channelId !== id)))
    if (chat) {
      console.log(chat.channelName);
      setRooms([chat, ...rooms]);
    }
  }

  function handleCardClick(id: number, type: ChatType) {
    if (type === "protected") {
      setPasswordModalOpen(true);
      setSelectChat(globalChats.find((chat) => (chat.channelId === id)));
    } else {
      joinChat(id);
    }
  }
  
  return (
    <>
      <MediaCard
        imageUrl="https://cdn.dribbble.com/userupload/4239195/file/original-6b394022fdad0c9e88cf347bf38220be.png?compress=1&resize=640x480&vertical=top"
        title="Public Chatrooms"
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

      <VirtualizedChatList rooms={globalChats} isLoading={isLoading} handleCardClick={handleCardClick} />

      <EnterProtectedModal room={selectChat} isModalOpen={passwordModalOpen} setIsModalOpen={setPasswordModalOpen} joinChat={joinChat} />
    </>
  );
}

export default GlobalChatList;