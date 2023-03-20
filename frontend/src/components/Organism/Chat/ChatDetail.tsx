import * as Dummy from '@/dummy/data'

import React, { FC, useEffect, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import { Message } from '@/types/chat'

import { useParams } from 'react-router-dom';
import MessageSender from '@/components/Molecule/Chat/Detail/MessageSender';
import MessageList from '@/components/Molecule/Chat/Detail/MessageList';
import MessageHeader from '@/components/Molecule/Chat/Detail/MessageHeader';

interface Props {
}

const ChatRoom: React.FC<Props> = () => {

  function fetchMessagesByRoomId(index : number) {
    return Dummy.dummy_chatdata[index];
  }

  //async function fetchMessagesByRoomId(roomId: number): Promise<Message[]> {
  //// roomId를 사용하여 메시지를 가져오는 코드
  //}
  
  const { roomId } = useParams();
  const roomIdNumber = Number(roomId) - 1;
  const [messages, setMessages] = useState<Message[]>([]);

  /* dummyData */
  const userId = 1;
  const [messageId, setMessageId] = useState(200);

  const users = Object.fromEntries(Dummy.dummy_users.map(item => [item.userId, item]));
  const room = Dummy.dummy_chatrooms[roomIdNumber];

  function getMessageId () {
    setMessageId(messageId+1);
    return messageId;
  }
  /* dummyData */

  // roomId가 변경될때마다 fetch 이후 리렌더링
  useEffect(() => {
    if (!isNaN(roomIdNumber)) {
      setMessages(fetchMessagesByRoomId(roomIdNumber));
      //fetchMessagesByRoomId(roomIdNumber).then((fetchedMessages) => {
        //setMessages(fetchedMessages);
      //});
    }
  }, [roomIdNumber]);

  function sendMessage(textContent: string) {
    const formattedTime = new Date(Date.now()).toISOString().replace('T', ' ').slice(0, -5);
    const message : Message = {messageId: getMessageId(), userId:userId, content:textContent, created_at:formattedTime};
    setMessages([...messages, message]);
  }


  return (
    <>
      <div><MessageHeader room={room} users={users} /></div>
      <div className="flex-1 overflow-y-auto">
        <MessageList myId={userId} users={users} messages={messages} />
      </div>
      <div>
        <MessageSender sendMessage={sendMessage} />
      </div>
    </>
  );



};

export default ChatRoom;