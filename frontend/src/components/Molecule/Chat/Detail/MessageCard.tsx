import { Message, User } from "@/types/chat";
import { FC } from "react";
import AvatarSet from "../AvatarSet";

interface MessageCardProps {
  message: Message;
  sender: User;
  isMyMessage: boolean;
  isFirstMessage: boolean;
  isLastMessage: boolean;
  scrollY: number;
};

const MessageCard : FC<MessageCardProps> = ({
  message, sender,
  isMyMessage, isFirstMessage, isLastMessage,
  scrollY
}) => {

  return (
    <div
      key={message.messageId}
      className={`flex items-end space-x-2
                ${isFirstMessage ? 'space-y-4' : ''}
                ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      {!isMyMessage && (
        <div className={`relative transition-opacity duration-300
                        ${isFirstMessage? '' : 'invisible'}
                        ${isLastMessage? 'pb-4' : ''}`}
        >
          <AvatarSet user={sender} scrollY={scrollY} />
        </div>
      )}

      <div className={`ml-2 ${isMyMessage ? 'text-right pl-8' : 'text-left pr-8'}`}>
        {isFirstMessage && !isMyMessage &&
          <p className="text-sm text-gray-600">{sender.nickname}</p>
        }
        <div
          className={`inline-block px-3 py-2 mt-1 rounded-lg text-sm ${
            isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {message.content}
        </div>
        {isLastMessage && (
          <p className="text-xs text-gray-500 mt-1">{message.created_at}</p>
        )}
      </div>
    </div>
  );
}

export default MessageCard;