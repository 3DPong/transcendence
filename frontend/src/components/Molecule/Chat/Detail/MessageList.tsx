
// src/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { Message, User } from '@/types/chat';
import MessageCard from '@/components/Molecule/Chat/Detail/MessageCard'
import { Box } from '@mui/material';

interface MessageListProps {
  myId: number;
  messages: Message[];
  users:{
    [k: string]: User;
  };
};

const MessageList: React.FC<MessageListProps> = ({ myId, messages, users }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box>
      {messages.map((message, index) => {
        const isMyMessage = message.userId === myId;
        const sender = users[message.userId];
        const isFirstMessage = index === 0 || messages[index - 1].userId !== message.userId;
        const isLastMessage = index === messages.length - 1 || messages[index + 1].userId !== message.userId;

        return (
          <MessageCard
            key={message.messageId}
            message={message}
            sender={sender}
            isMyMessage={isMyMessage}
            isFirstMessage={isFirstMessage}
            isLastMessage={isLastMessage}
          />
        );
      })}
      <div ref={messagesEndRef}></div>
    </Box>
  );
};

export default MessageList;
