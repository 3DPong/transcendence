import React, {FC, useContext, useEffect, useState} from "react";
import SearchTextField from "@/components/Molecule/SearchTextField";
import MediaCard from "@/components/Molecule/MediaCard";
import AddCommentIcon from '@mui/icons-material/AddComment';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

import VirtualizedChatList from '@/components/Molecule/Chat/ChatList'
import { Room } from "@/types/chat";
import * as Dummy from "@/dummy/data";
import ButtonLink from "@/components/Molecule/Link/ButtonLink";
import GlobalContext from "@/GlobalContext";


interface ChatListProps {
}

const LocalChatList : FC<ChatListProps> = () => {
  const {rooms, setRooms} = useContext(GlobalContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>("");
 
  useEffect(() => {
    async function fetchRooms() {
      setIsLoading(true);
      setRooms(Dummy.dummy_chatrooms)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    fetchRooms().then(() =>{
      setIsLoading(false);
    });
  });

  function findRoomsByString(rooms: Room[], searchString : string) {
    if (searchString)
      return rooms.filter((room) => { return room.channelName.includes(searchString); });
    else
      return rooms;
  }

  return (
    <>
      <MediaCard
        imageUrl="https://cdn.dribbble.com/userupload/2416463/file/original-ff769e3101b39c1e474e018cd1874138.png?compress=1&resize=640x480&vertical=top"
        title="My Chatrooms"
        body="body2 text"
      />

      <div className=" absolute top-32 right-16">
        <ButtonLink primary="Create Chat" to="./create" sx={{color: "#ffffffff"}} >
          <AddCommentIcon fontSize="large" />
        </ButtonLink>
      </div> 
      <div className=" absolute top-32 right-4">
        <ButtonLink primary="Add Chat" to="./add" sx={{color: "#ffffffff"}} >
          <TravelExploreIcon fontSize="large" />
        </ButtonLink>
      </div> 

      <div className=" border m-0 p-4">
        <SearchTextField state={searchString} setState={setSearchString}
          placeholder={"참여채팅 검색"}/>
      </div>

      <VirtualizedChatList rooms={findRoomsByString(rooms, searchString)} isLoading={isLoading} isLocal={true}/>
    </>
  );
}

export default LocalChatList;