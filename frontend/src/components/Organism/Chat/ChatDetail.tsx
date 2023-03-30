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


interface ChatDetailProps {
}

const ChatDetail: FC<ChatDetailProps> = () => {

  const {channels, setChannels} = useContext(GlobalContext);
  const { channelId } = useParams();
  const channelIdNumber = Number(channelId);
  const [channel, setChannel] = useState<Channel>(defaultChannel);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [banList, setBanList] = useState<ChatUser[]>([]);
  const [muteList, setMuteList] = useState<number[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [skip, setSkip] = useState(0);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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
      deleted_at: usr.deleted_at,
    }));
    return usrs;
  }

  async function fetchBanListByChannelId(_channelId : number) {
    const response = await fetch(API_URL + "/chat/" + _channelId + "/banlist");
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
      const [usrs, msgs, bans, mutes] = await Promise.all([
        fetchUsersByChannelId(channelIdNumber),
        fetchMessagesByChannelId(channelIdNumber, 0),
        fetchBanListByChannelId(channelIdNumber),
        fetchMuteListByChannelId(channelIdNumber),
      ])
      setUsers(usrs);
      setMessages(msgs);
      setBanList(bans);
      setMuteList(mutes);
      setIsAdmin(["admin", "owner"].includes(usrs.find((u)=>(u.id === userId))?.role || "none"))
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
        <MessageList myId={userId} users={users} messages={messages} />
        <MenuDrawer
          open={drawerOpen}
          handleClose={()=>{setDrawerOpen(false)}}
          userlist={users.filter((u)=>(u.deleted_at === null))}
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