
// src/MessageList.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Message, ChatUser, defaultChatUser } from '@/types/chat';
import MessageCard from '@/components/Molecule/Chat/Detail/MessageCard'

interface MessageListProps {
  myId: number;
  messages: Message[];
  users: ChatUser[];
};

const MessageList: React.FC<MessageListProps> = ({ myId, messages, users }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState<number>(0);
  const userMap = new Map<number, ChatUser>(users.map((user) => [user.id, user]));

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className=" pl-2 pr-4 border-l border-r border-gray-200 flex-1 overflow-y-auto
                    scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
        onScroll={(event)=>setScrollY(event.currentTarget.scrollTop)}>
      {messages.map((message, index) => {
        const isMyMessage = message.senderId === myId;
        const sender = userMap.get(message.senderId) || defaultChatUser;
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