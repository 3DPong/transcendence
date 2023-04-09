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
import { useSocket } from '@/context/SocketContext';


interface ChatDetailProps {
}

const ChatDetail: FC<ChatDetailProps> = () => {

  const {channels, loggedUserId} = useContext(GlobalContext);
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

  const {chatSocket} = useSocket();


  async function fetchUsersByChannelId(_channelId : number) {
    const response = await fetch(API_URL + "/chat/" + _channelId + "/users" + "?id="+loggedUserId, {
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
      status: "none",
      deleted_at: usr.deleted_at,
    }));
    return usrs;
  }

  async function fetchBanListByChannelId(_channelId : number) {
    const response = await fetch(API_URL + "/chat/" + _channelId + "/banlist" + "?id="+loggedUserId);
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
    const response = await fetch(API_URL + "/chat/" + _channelId + "/mutelist" + "?id="+loggedUserId);
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

  useEffect(() => {
    console.log("socket useEffect in");
    if (chatSocket) {
      // 이게 의미가 있나? 현재 채팅방의 이벤트인지 확인 후 처리
      chatSocket.on('chat', (message) => {
        console.log("in Detail onMessage => "+ message);
        // 여기서는 상세 메시지에 추가하기
      });
      chatSocket.on('kick', (message) => {
        console.log(message)
      });
      chatSocket.on('ban', (message) => {
        console.log(message)
      });
      chatSocket.on('mute', (message) => {
        console.log(message);
      });
    }
    return () => {
      console.log("socket userEffect out");
    }
    // channelId가 변할땐 메시지들을 그대로 둠
  }, [chatSocket/*, channelId*/]);

  function sendMessage(textContent: string) {
    if (chatSocket && loggedUserId) {
      console.log("sendMessage");
      chatSocket.emit('message-chat', {message: textContent, channel_id: channelIdNumber});

      const formattedTime = new Date(Date.now()).toISOString().replace('T', ' ').slice(0, -5);
      const message : Message = {id: getMessageId(), senderId:loggedUserId, content:textContent, created_at:formattedTime};
      setMessages([...messages, message]);
    }
  }

  const [messageId, setMessageId] = useState(100000000);

  function getMessageId () {
    setMessageId(messageId+1);
    return messageId;
  }

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
        setIsAdmin(["admin", "owner"].includes(usrs.find((u)=>(u.id === loggedUserId))?.role || "none"))
      } catch (error) {
        handleError("Init Fetch", (error as Error).message);
      }
    };
    if (loggedUserId)
      init();

    // 컴포넌트 언마운트. channelId가 변경될떄도 언마운트가 실행된다. 
    return () => {
    }
  }, [channelId, loggedUserId]);

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
      <ChatContext.Provider
        value={{
          isAdmin, setIsAdmin,
          muteList, setMuteList,
          banList, setBanList
        }}>
        <MessageList
          channelId={channelIdNumber}
          users={users}
          messages={messages}
          setMessages={setMessages}
        />
        <MenuDrawer
          users={users.filter((user)=>(user.deleted_at === null))}
          setUsers={setUsers}
          open={drawerOpen}
          handleClose={()=>{setDrawerOpen(false)}}
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