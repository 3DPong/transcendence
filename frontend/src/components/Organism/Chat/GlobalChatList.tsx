import React, { FC, useContext, useEffect, useState } from 'react';
import SearchTextField from '@/components/Molecule/SearchTextField';
import MediaCard from '@/components/Molecule/MediaCard';

import VirtualizedChatList from '@/components/Molecule/Chat/List/ChannelList';
import { ChannelType, Channel } from '@/types/chat';
import EnterProtectedModal from '@/components/Molecule/Chat/List/EnterProtectedModal';

import GlobalContext from '@/context/GlobalContext';
import { API_URL } from '@/../config/backend';
import { useAlert } from '@/context/AlertContext';

interface ChatListProps {}

const GlobalChatList: FC<ChatListProps> = () => {
  const searchMin = 1;

  const [globalChats, setGlobalChats] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectChat, setSelectChat] = useState<Channel>();

  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);

  const { channels, setChannels, loggedUserId } = useContext(GlobalContext);
  const { handleAlert } = useAlert();

  useEffect(() => {
    if (searchString.length < searchMin) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  }, [searchString]);

  function searchButtonClick() {
    if (submitDisabled) return;
    setIsLoading(true);
    async function fetchChannels() {
      const response = await fetch(API_URL + '/chat/search/' + searchString);
      if (!response.ok) {
        const error = await response.json();
        handleAlert('Search Channels', error.message);
        return;
      }
      const fetchChannels = await response.json();
      setGlobalChats(
        fetchChannels.map((ch: any) => ({
          id: ch.channel_id,
          type: ch.type,
          title: ch.name,
          owner: {
            id: ch.owner.user_id,
            nickname: ch.owner.nickname,
            profile: ch.owner.profile_url,
          },
        }))
      );
      setIsLoading(false);
    }
    fetchChannels();
  }

  function searchButtonKeyup(event: React.KeyboardEvent) {
    if (event.key === 'Enter') searchButtonClick();
  }

  function joinChannel(id: number, password: string | null = null) {
    async function fetchJoinChannel() {
      const response = await fetch(API_URL + '/chat/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_id: id,
          password: password,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        handleAlert('Channel Join', error.message);
        return;
      }

      const channel = globalChats.find((channel) => channel.id === id);
      setGlobalChats(globalChats.filter((channel) => channel.id !== id));
      if (channel) {
        console.log(channel.title);
        setChannels([channel, ...channels]);
      }
    }
    fetchJoinChannel();
  }

  function handleCardClick(id: number, type: ChannelType) {
    if (type === 'protected') {
      setPasswordModalOpen(true);
      setSelectChat(globalChats.find((chat) => chat.id === id));
    } else {
      joinChannel(id);
    }
  }

  return (
    <>
      <MediaCard
        imageUrl="https://cdn.dribbble.com/userupload/4239195/file/original-6b394022fdad0c9e88cf347bf38220be.png?compress=1&resize=640x480&vertical=top"
        title="Public Channels"
        body="body2 text"
      />

      <div className=" border m-0 p-4 bg-white">
        <SearchTextField
          state={searchString}
          setState={setSearchString}
          onClick={searchButtonClick}
          onKeyUp={searchButtonKeyup}
          placeholder={'공개 채팅방 검색'}
          disabled={submitDisabled}
          disabledHelperText={searchMin + '글자 이상 입력하세요'}
        />
      </div>

      <VirtualizedChatList channels={globalChats} isLoading={isLoading} handleCardClick={handleCardClick} />

      <EnterProtectedModal
        channel={selectChat}
        isModalOpen={passwordModalOpen}
        setIsModalOpen={setPasswordModalOpen}
        joinChannel={joinChannel}
      />
    </>
  );
};

export default GlobalChatList;
