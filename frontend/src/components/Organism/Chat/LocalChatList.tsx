import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import SearchTextField from '@/components/Molecule/SearchTextField';
import MediaCard from '@/components/Molecule/MediaCard';
import AddCommentIcon from '@mui/icons-material/AddComment';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

import VirtualizedChatList from '@/components/Molecule/Chat/List/ChannelList';
import { Channel } from '@/types/chat';
import ButtonLink from '@/components/Molecule/Link/ButtonLink';
import GlobalContext from '@/context/GlobalContext';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '@/../config/backend';
import { useError } from '@/context/ErrorContext';
import { useSocket } from '@/context/SocketContext';

interface ChatListProps {}

const LocalChatList: FC<ChatListProps> = () => {
  const navigate = useNavigate();
  const { loggedUserId, channels, setChannels } = useContext(GlobalContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');
  const { handleError } = useError();

  // 나중에 컨트롤바로 넘겨야되고, 세션쿠키를 이용해서 연결할 예정
  const { chatSocket, chatConnect } = useSocket();

  const channelsRef = useRef<Channel[]>(channels);

  const { channelId } = useParams();
  const channelIdRef = useRef(channelId);

  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  useEffect(() => {
    if (chatSocket) {
      // for (const channel of channels) {
      //   console.log("======>" + channel.id);
      //   // join 으로 변경 필요?
      //   chatSocket.emit('enter-chat', { channel_id: channel.id });
      // }
      chatSocket.on('alarm', (message) => {
        switch (message.type) {
          case 'invite':
            const data = message.message;
            const ch: Channel = {
              id: data.channel_id,
              title: data.type === 'dm' ? data.owner.nickname + '님과의 DM' : data.name,
              thumbnail: data.type === 'dm' ? data.owner.profile_url : data.thumbnale_url,
              type: data.type,
              owner: {
                id: data.owner.user_id,
                nickname: data.owner.nickname,
                profile: data.owner.profile_url,
              },
            };
            // 겹치지 않는 채널만 추가 
            if (-1 === channelsRef.current.findIndex((channel) => (channel.id === ch.id)))
              setChannels([ch, ...channelsRef.current]);
            // 이건 로그인이후. handleError => handleAlarm 같은걸로 변경해야함. 
            break;
          case 'chat':
            console.log(message.message);
            break;
          case 'ban':
            // 채널리스트에 들어와있을때
            console.log("current");
            console.log(channelsRef.current);
            setChannels(channelsRef.current.filter((channel)=>(channel.id != message.channel_id)));
            // 해당 채널에 들어와있는경우
            console.log(channelIdRef.current);
            if (channelIdRef.current === message.channel_id)
              navigate(`/channels`);
            // 이건 로그인이후.
            handleError('Ban ' + message.channel_id, message.message);
            break;
          case 'kick':
            // 채널리스트에 들어와있을때
            console.log("current");
            console.log(channelsRef.current);
            setChannels(channelsRef.current.filter((channel)=>(channel.id != message.channel_id)));
            // 해당 채널에 들어와있는경우
            if (channelIdRef.current === message.channel_id)
              navigate(`/channels`);
            // 이건 로그인이후.
            handleError('Kick ' + message.channel_id, message.message);
            console.log(message.message);
            break;
          default:
            break;
        }
      });
    }
  }, [chatSocket]);

  useEffect(() => {
    setIsLoading(true);
    async function fetchChannels() {
      const response = await fetch(API_URL + '/chat');
      const fetchChannels = await response.json();
      const newChannels : Channel[] = fetchChannels.map((ch: any) => ({
        id: ch.channel_id,
        type: ch.type,
        title: ch.type === 'dm' ? ch.owner.nickname + '님과의 DM' : ch.name,
        thumbnail: ch.type === 'dm' ? ch.owner.profile_url : ch.thumbnale_url,
        owner: {
          id: ch.owner.user_id,
          nickname: ch.owner.nickname,
          profile: ch.owner.profile_url,
        },
      }));

      const filteredChannels = channelsRef.current.filter((oChannel) => (
        -1 === newChannels.findIndex((nChannel: Channel) => nChannel.id === oChannel.id)
      ));

      setChannels([...filteredChannels, ...newChannels]);
      if (!response.ok) {
        const errorData = await response.json();
        handleError('Fetch MyChannels', errorData.message);
        return;
      }
      setIsLoading(false);

      // 소켓연결 Connect 호출

      console.log("======chatConnectBef======");
      if (loggedUserId) {
        chatConnect();
        console.log("======chatConnectAft======");
      }
      // ======
    }
    if (loggedUserId) fetchChannels();
  }, [loggedUserId]);

  function findChannelsByString(channels: Channel[], searchString: string) {
    if (searchString)
      return channels.filter((channel) => {
        return channel.title.includes(searchString);
      });
    else return channels;
  }

  function handleCardClick(id: number) {
    navigate(`/channels/${id}`);
  }

  return (
    <>
      <MediaCard
        imageUrl="https://cdn.dribbble.com/userupload/2416463/file/original-ff769e3101b39c1e474e018cd1874138.png?compress=1&resize=640x480&vertical=top"
        title="My Channels"
        body="body2 text"
      />

      <div className=" absolute top-32 right-16">
        <ButtonLink primary="Create Chat" to="./create" sx={{ color: '#ffffffff' }}>
          <AddCommentIcon fontSize="large" />
        </ButtonLink>
      </div>
      <div className=" absolute top-32 right-4">
        <ButtonLink primary="Add Chat" to="./add" sx={{ color: '#ffffffff' }}>
          <TravelExploreIcon fontSize="large" />
        </ButtonLink>
      </div>

      <div className=" border m-0 p-4">
        <SearchTextField state={searchString} setState={setSearchString} placeholder={'참여채팅 검색'} />
      </div>

      <VirtualizedChatList
        channels={findChannelsByString(channels, searchString)}
        isLoading={isLoading}
        handleCardClick={handleCardClick}
      />
    </>
  );
};

export default LocalChatList;
