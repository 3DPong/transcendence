import { Message, User, UserStatus } from "@/types/chat";
import { Avatar, Badge } from "@mui/material";
import { styled } from '@mui/material/styles';
import { FC } from "react";

const getBadgeColor = (status: UserStatus = "none") => {
  switch (status) {
    case 'online':
      return '#44b700';
    case 'offline':
      return '#808080';
    case 'ingame':
      return '#ff0000';
    case 'none':
      return '#ffffff';
    default:
      return '#808080';
  }
};

const StyledBadge = styled(Badge)<{ status: UserStatus }>(({ status = "none", theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: getBadgeColor(status),
    color: getBadgeColor(status),
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'offline' ? 'none' : 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

interface MessageCardProps {
  message: Message;
  sender: User;
  isMyMessage: boolean;
  isFirstMessage: boolean;
  isLastMessage: boolean;
};

const MessageCard : FC<MessageCardProps> = ({message, sender, isMyMessage, isFirstMessage, isLastMessage}) => {
  function onAvatarClick(s : string) {};

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
          <StyledBadge
            status={sender.status || 'none'}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              src={sender.profile}
              alt={sender.nickname}
              className="cursor-pointer"
              onClick={() => onAvatarClick(sender.nickname)}
            />
          </StyledBadge>
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