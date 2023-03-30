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

interface ChatDetailProps {
}



const ChatDetail: FC<ChatDetailProps> = () => {

  const {channels, setChannels} = useContext(GlobalContext);
  const { channelId } = useParams();
  const channelIdNumber = Number(channelId);
  const [channel, setChannel] = useState<Channel>(defaultChannel);

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [skip, setSkip] = useState(0);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  //export interface Message {
    //id : number;
    //senderId : number;
    //content : string;
    //created_at : string;
  //};
  // channelId가 변경될때마다 fetch 이후 리렌더링
  async function fetchMessagesByChannelId(_channelId : number, _skip : number) {
    const response = await fetch(API_URL + "/chat/" + _channelId + "/log?take=20&skip=" + _skip, {
      cache: 'no-cache'
    });
    const fetchMessages = await response.json();
    const msgs : Message[] = fetchMessages.map((msg : any) => ({
      id: msg.message_id,
      senderId: msg.user_id,
      content: msg.content,
      created_at: new Date(Date.parse(msg.created_at)).toISOString().replace('T', ' ').slice(0, -5),
    }));
    setSkip(_skip + 20);
    return msgs;
  }

  //export interface User {
    //id: number;
    //profile: string;
    //nickname: string;
  //};

  //export interface ChatUser extends User {
    //role : UserRole;
    //status? : UserStatus;
    //isMuted? : boolean;
  //};
  async function fetchUsersByChannelId(_channelId : number) {
    const response = await fetch(API_URL + "/chat/" + _channelId + "/users", {
      cache: 'no-cache'
    });
    const fetchUsers = await response.json();
    const usrs : ChatUser[] = fetchUsers.map((usr : any) => ({
      id: usr.user.user_id,
      profile: usr.user.profile_url,
      nickname: usr.user.nickname,
      role: usr.role,
      status: "online",
    }));
    return usrs;
  }

  const handleGameCreate = (gameType: string) => {
    //createBattle();
    setShowNotification(true);
    setBattleModalOpen(false);
  };

  function sendMessage(textContent: string) {
    const formattedTime = new Date(Date.now()).toISOString().replace('T', ' ').slice(0, -5);
    const message : Message = {id: getMessageId(), senderId:userId, content:textContent, created_at:formattedTime};
    setMessages([...messages, message]);
  }

  /* dummyData */
  const userId = 63;
  const [messageId, setMessageId] = useState(200);

  function getMessageId () {
    setMessageId(messageId+1);
    return messageId;
  }
  /* dummyData */
  useEffect(() => {
    console.log("Fetch User and Message")
    async function init() {
      setShowNotification(false);
      setDrawerOpen(false);
      const [usrs, msgs] = await Promise.all([
        fetchUsersByChannelId(channelIdNumber),
        fetchMessagesByChannelId(channelIdNumber, 0)
      ])
      console.log(msgs);
      setUsers(usrs);
      setMessages(msgs);
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
      <MessageHeader channel={channel} memberCount={users.length} handleMenuButton={()=>{setDrawerOpen(true)}}/>
      <MessageList myId={userId} users={users} messages={messages} />
      <MessageSender sendMessage={sendMessage} handleBattleButton={()=>{setBattleModalOpen(true)}} />
      <MenuDrawer isAdmin={true} open={drawerOpen} handleClose={()=>{setDrawerOpen(false)}} userlist={users} banlist={users} />

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