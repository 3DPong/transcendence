import React, { FC, useContext, useEffect, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import { Channel, ChatUser, defaultChannel, Message } from '@/types/chat'

import { useParams } from 'react-router-dom';
import MessageSender from '@/components/Molecule/Chat/Detail/MessageSender';
import MessageList from '@/components/Molecule/Chat/Detail/MessageList';
import MessageHeader from '@/components/Molecule/Chat/Detail/MessageHeader';
import BattleRequestModal from '@/components/Molecule/Chat/Detail/BattleRequestModal';
import BattleNotification from '@/components/Molecule/Chat/Detail/BattleNotification';
import MenuDrawer from '@/components/Organism/Chat/MenuDrawer';
import { API_URL } from '@/../config/backend';
import GlobalContext from '@/context/GlobalContext';
import ChatContext from '@/context/ChatContext';
import { useError } from '@/context/ErrorContext';


interface ChatDetailProps {
}

const ChatDetail: FC<ChatDetailProps> = () => {

  const {channels} = useContext(GlobalContext);
  const { channelId } = useParams();
  const channelIdNumber = Number(channelId);
  const [channel, setChannel] = useState<Channel>(defaultChannel);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [banList, setBanList] = useState<ChatUser[]>([]);
  const [muteList, setMuteList] = useState<number[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const {handleError} = useError();


  async function fetchUsersByChannelId(_channelId : number) {
    const response = await fetch(API_URL + "/chat/" + _channelId + "/users", {
      cache: 'no-cache'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unknown error occurred');
    }
    const fetchUsers = await response.json();
    const usrs : ChatUser[] = fetchUsers.map((usr : any) => ({
      id: usr.user.user_id,
      profile: usr.user.profile_url,
      nickname: usr.user.nickname,
      role: usr.role,
      status: "online",
      deleted_at: usr.deleted_at,
    }));
    return usrs;
  }

  async function fetchBanListByChannelId(_channelId : number) {
    const response = await fetch(API_URL + "/chat/" + _channelId + "/banlist");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Unknown error occurred");
    }
    const fetchBanList = await response.json();

    const banlist : ChatUser[] = fetchBanList.map((usr : any) => ({
      id: usr.user.user_id,
      profile: usr.user.profile_url,
      nickname: usr.user.nickname,
      role: "none",
      status: "none",
      deleted_at: usr.end_at,
    }));
    return banlist;
  }

  async function fetchMuteListByChannelId(_channelId : number) {
    const response = await fetch(API_URL + "/chat/" + _channelId + "/mutelist");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Unknown error occurred");
    }
    const fetchMuteList = await response.json();

    const mutelist : number[] = fetchMuteList.map((usr : any) => {
      return (usr.user.user_id);
    });
    return mutelist;
  }

  const handleGameCreate = (gameType: string) => {
    //createBattle();
    setShowNotification(true);
    setBattleModalOpen(false);
  };

  /* dummyData */
  function sendMessage(textContent: string) {
    const formattedTime = new Date(Date.now()).toISOString().replace('T', ' ').slice(0, -5);
    const message : Message = {id: getMessageId(), senderId:userId, content:textContent, created_at:formattedTime};
    setMessages([...messages, message]);
  }

  const userId = 63;
  const [messageId, setMessageId] = useState(200);

  function getMessageId () {
    setMessageId(messageId+1);
    return messageId;
  }
  /* dummyData */

  useEffect(() => {
    async function init() {
        setShowNotification(false);
        setDrawerOpen(false);
      try {
        const [usrs, bans, mutes] = await Promise.all([
          fetchUsersByChannelId(channelIdNumber),
          fetchBanListByChannelId(channelIdNumber),
          fetchMuteListByChannelId(channelIdNumber),
        ]);
        setUsers(usrs);
        setBanList(bans);
        setMuteList(mutes);
        setIsAdmin(["admin", "owner"].includes(usrs.find((u)=>(u.id === userId))?.role || "none"))
      } catch (error) {
        handleError("Init Fetch", (error as Error).message);
      }
    };
    init();
  }, [channelId]);

  useEffect(() => {
    const channel = channels.find((ch)=>(ch.id === channelIdNumber));
    if (channel)
      setChannel(channel);
  }, [channelId, channels])

  return (
    <div className="flex flex-col h-full">
      <MessageHeader
        channel={channel}
        memberCount={users.filter((u)=>(u.deleted_at === null)).length}
        handleMenuButton={()=>{setDrawerOpen(true)}}/>
      <ChatContext.Provider value={{isAdmin, setIsAdmin, muteList, setMuteList, banList, setBanList}}>
        <MessageList
          channelId={channelIdNumber}
          myId={userId}
          users={users}
          messages={messages}
          setMessages={setMessages}
        />
        <MenuDrawer
          open={drawerOpen}
          handleClose={()=>{setDrawerOpen(false)}}
          userlist={users.filter((u)=>(u.deleted_at === null))}
          channel={channel}
        />
      </ChatContext.Provider>
      <MessageSender sendMessage={sendMessage} handleBattleButton={()=>{setBattleModalOpen(true)}} />

      <BattleRequestModal
        open={battleModalOpen}
        onClose={() => setBattleModalOpen(false)}
        onGameCreate={handleGameCreate}
      />
      { showNotification && (
        <div className="absolute top-14 left-0 right-0 ">
          <BattleNotification onClose={() => setShowNotification(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatDetail;