import React, {FC, useContext, useEffect, useState} from "react";
import SearchTextField from "@/components/Molecule/SearchTextField";
import MediaCard from "@/components/Molecule/MediaCard";
import AddCommentIcon from '@mui/icons-material/AddComment';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

import VirtualizedChatList from '@/components/Molecule/Chat/List/ChannelList'
import { Channel } from "@/types/chat";
import ButtonLink from "@/components/Molecule/Link/ButtonLink";
import GlobalContext from "@/context/GlobalContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/../config/backend";


interface ChatListProps {
}

const LocalChatList : FC<ChatListProps> = () => {
  const navigate = useNavigate();
  const {channels, setChannels} = useContext(GlobalContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>("");

//export interface Channel {
  //id : number;
  //thumbnail? : string;
  //title : string;
  //type : ChannelType;
  //owner : User;
//};

//export interface User {
  //id: number;
  //profile: string;
  //nickname: string;
//};

  useEffect(() => {
    setIsLoading(true);
    async function fetchChannels() {
      const response = await fetch(API_URL + "/chat");
      const fetchChannels = await response.json();
      setChannels(fetchChannels.map((ch : any) => ({
        id: ch.channel_id,
        type: ch.type,
        title: ch.name,
        owner: {
          id: ch.owner.user_id,
          nickname: ch.owner.nickname,
          profile: ch.owner.profile_url,
        },
      })));
      setIsLoading(false);
    };
    fetchChannels();
  }, []);

  function findChannelsByString(channels: Channel[], searchString : string) {
    if (searchString)
      return channels.filter((channel) => { return channel.title.includes(searchString); });
    else
      return channels;
  }

  function handleCardClick(id:number) {
    navigate(`/channels/${id}`)
  }

  return (
    <>
      <MediaCard
        imageUrl="https://cdn.dribbble.com/userupload/2416463/file/original-ff769e3101b39c1e474e018cd1874138.png?compress=1&resize=640x480&vertical=top"
        title="My Channels"
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

      <VirtualizedChatList channels={findChannelsByString(channels, searchString)} isLoading={isLoading} handleCardClick={handleCardClick} />
    </>
  );
}

export default LocalChatList;