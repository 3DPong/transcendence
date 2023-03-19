import React, {FC, useEffect, useState} from "react";
import SearchTextField from "@/components/Molecule/SearchTextField";
import MediaCard from "@/components/Molecule/MediaCard";

import VirtualizedChatList from '@/components/Molecule/Chat/ChatList'
import { Room } from "@/types/chat";
import * as Dummy from "@/dummy/data";


interface ChatListProps {
}

const GlobalChatList : FC<ChatListProps> = () => {

  const [chats, setChats] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>("");
 
  //async function fetchGlobalChats() : Promise<Room[]> {
    // isLocal? 에 따라 fetchURL 변경
    //return [];
  //}

  function searchButtonClick() {
    setChats(Dummy.dummy_chatrooms);
  }

  function searchButtonKeyup(event: React.KeyboardEvent) {
    if (event.key === 'Enter')
      searchButtonClick();
  }

  useEffect(() => {
    async function fetchRooms() {
    }
  })
  
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

      <VirtualizedChatList rooms={chats} isLoading={isLoading} isLocal={false}/>
    </>
  );
}

export default GlobalChatList;