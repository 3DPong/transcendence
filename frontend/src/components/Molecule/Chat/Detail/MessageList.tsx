
// src/MessageList.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Message, ChatUser } from '@/types/chat';
import MessageCard from '@/components/Molecule/Chat/Detail/MessageCard'

interface MessageListProps {
  myId: number;
  messages: Message[];
  //users:{
    //[k: string]: User;
  //};
  users: ChatUser[];
};

const MessageList: React.FC<MessageListProps> = ({ myId, messages, users }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState<number>(0);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  function getUser(userId: number) {
    return users.find((user)=>(user.id === userId)) || {"id": 0, "nickname" : "none", "profile" : "", "role":"user", "status": "none"};
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className=" pl-2 pr-4 border-l border-r border-gray-200 flex-1 overflow-y-auto
                    scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
        onScroll={(event)=>setScrollY(event.currentTarget.scrollTop)}>
      {messages.map((message, index) => {
        const isMyMessage = message.senderId === myId;
        //const sender = users[message.userId];
        const sender = getUser(message.senderId);
        const isFirstMessage = index === 0 || messages[index - 1].senderId !== message.senderId;
        const isLastMessage = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId;

        return (
          <MessageCard
            key={message.id}
            message={message}
            sender={sender}
            isMyMessage={isMyMessage}
            isFirstMessage={isFirstMessage}
            isLastMessage={isLastMessage}
            scrollY={scrollY}
          />
        );
      })}
      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default MessageList;