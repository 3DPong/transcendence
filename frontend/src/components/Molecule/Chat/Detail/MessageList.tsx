
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Message, ChatUser, defaultChatUser } from '@/types/chat';
import MessageCard from '@/components/Molecule/Chat/Detail/MessageCard'
import { API_URL } from '@/../config/backend';
import { useError } from '@/context/ErrorContext';

interface MessageListProps {
  channelId: number
  myId: number;
  users: ChatUser[];
  messages: Message[];
  setMessages: (messages : Message[]) => void;
};

const MessageList: React.FC<MessageListProps> = ({ channelId, myId, users, messages, setMessages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState<number>(0);
  const [prevScrollHeight, setPrevScrollHeight] = useState<number>(0);
  const [fetchCount, setFetchCount] = useState<number>(0);
  const [scrollState, setScrollState] = useState<number>(1);
  const userMap = new Map<number, ChatUser>(users.map((user) => [user.id, user]));
  const {handleError} = useError();

  async function fetchMessagesByChannelId(skip:number) {
    const response = await fetch(API_URL + "/chat/" + channelId + "/log?take=20&skip=" + skip, {
      cache: 'no-cache'
    });
    if (!response.ok) {
      const errorData = await response.json();
      handleError("Message Fetch", errorData.message);
    }
    const fetchMessages = await response.json();
    const msgs : Message[] = fetchMessages.map((msg : any) => ({
      id: msg.message_id,
      senderId: msg.user_id,
      content: msg.content,
      created_at: new Date(Date.parse(msg.created_at)).toISOString().replace('T', ' ').slice(0, -5),
    }));
    return(msgs);
  }

  function scrollToBottom() {
    const element = document.getElementById("scrollable-element");
    if (element)
      element.scrollTop = element.scrollHeight; // 스크롤을 맨 아래로 이동
  }
  
  function scrollToPrevTop() {
    const element = document.getElementById("scrollable-element");
    if (element)
      element.scrollTop = element.scrollHeight - prevScrollHeight;
  }
  
  useEffect(() => {
    async function fetchMessages() {
      const msgs = await fetchMessagesByChannelId(0);
      setFetchCount(msgs.length);
      setMessages(msgs);
      setScrollState(1);
    }
    fetchMessages();
  }, [channelId]);

  useEffect(() => {
    switch (scrollState) {
      case 2:
        scrollToPrevTop();
        break;
      case 1:
        scrollToBottom();
        break;
      default:
    }
  }, [messages]);

  async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const scrollTop = event.currentTarget.scrollTop;
    const clientHeight = event.currentTarget.clientHeight;
    const scrollHeight = event.currentTarget.scrollHeight;
    setPrevScrollHeight(scrollHeight);
    setScrollY(scrollTop);
    setScrollState(((scrollTop + clientHeight) >= scrollHeight) ? 1 : 0);

    if (fetchCount === 20 && scrollTop === 0) {
      setScrollState(2);
      const msgs = await fetchMessagesByChannelId(messages.length);
      setFetchCount(msgs.length);
      setMessages([...msgs, ...messages]);
    }
  }

  return (
    <div
      id="scrollable-element"
      className=" pl-2 pr-4 border-l border-r border-gray-200 flex-1 overflow-y-auto
                    scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
      onScroll={handleScroll}>
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