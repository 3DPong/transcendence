import * as Dummy from '@/dummy/data'

import React, { FC, useEffect, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import { Message } from '@/types/chat'

import { useParams } from 'react-router-dom';
import MessageSender from '@/components/Molecule/Chat/Detail/MessageSender';
import MessageList from '@/components/Molecule/Chat/Detail/MessageList';
import MessageHeader from '@/components/Molecule/Chat/Detail/MessageHeader';
import BattleRequestModal from '@/components/Molecule/Chat/Detail/BattleRequestModal';
import BattleNotification from '@/components/Molecule/Chat/Detail/BattleNotification';
import MenuDrawer from '@/components/Organism/Chat/MenuDrawer';

interface ChatDetailProps {
}

const ChatDetail: FC<ChatDetailProps> = () => {

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleGameCreate = (gameType: string) => {
    //createBattle();
    setShowNotification(true);
    setBattleModalOpen(false);
  };

  function fetchMessagesByChannelId(index : number) {
    return Dummy.dummy_chatdata[index];
  }

  //async function fetchMessagesByChannelId(channelId: number): Promise<Message[]> {
  //// channelId를 사용하여 메시지를 가져오는 코드
  //}
  
  const { channelId } = useParams();
  const channelIdNumber = Number(channelId) - 1;
  const [messages, setMessages] = useState<Message[]>([]);

  /* dummyData */
  const userId = 1;
  const [messageId, setMessageId] = useState(200);

  //const users = Object.fromEntries(Dummy.dummy_users.map(item => [item.userId, item]));
  const users = Dummy.dummy_users;
  const channel = Dummy.dummy_chatrooms[channelIdNumber];

  function getMessageId () {
    setMessageId(messageId+1);
    return messageId;
  }
  /* dummyData */

  // channelId가 변경될때마다 fetch 이후 리렌더링
  useEffect(() => {
    setShowNotification(false);
    setDrawerOpen(false);
    if (!isNaN(channelIdNumber)) {
      setMessages(fetchMessagesByChannelId(channelIdNumber));
      //fetchMessagesByChannelId(channelIdNumber).then((fetchedMessages) => {
        //setMessages(fetchedMessages);
      //});
    }
  }, [channelIdNumber]);

  function sendMessage(textContent: string) {
    const formattedTime = new Date(Date.now()).toISOString().replace('T', ' ').slice(0, -5);
    const message : Message = {id: getMessageId(), senderId:userId, content:textContent, created_at:formattedTime};
    setMessages([...messages, message]);
  }

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