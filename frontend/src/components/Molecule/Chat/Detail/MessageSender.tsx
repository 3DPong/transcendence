import React, { FC, useState, useRef, KeyboardEvent } from 'react';
import { Send as SendIcon, Mail as MailIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface ChatDetailSenderProps {
  sendMessage: (message: string) => void;
  handleBattleButton: () => void;
}

const MessageSender: FC<ChatDetailSenderProps> = ({ sendMessage, handleBattleButton }) => {
  const [inputMessage, setInputMessage] = useState<string>('');

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="flex-shrink-0 p-2 border border-gray-200 flex items-center">
      <textarea
        value={inputMessage}
        onChange={(event) => setInputMessage(event.target.value)}
        placeholder="메시지 입력"
        rows={1}
        style={{ resize: 'none', overflowY: 'auto' }}
        className="form-control block w-full px-3 py-1.5
          text-base font-normal text-gray-700 bg-white bg-clip-padding
          border border-solid border-gray-300 rounded transition ease-in-out
          m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600focus:outline-none"
        onKeyPress={handleKeyPress}
      />
      <IconButton color="primary" onClick={handleSendMessage}>
        <SendIcon />
      </IconButton>
      <IconButton color="secondary" onClick={handleBattleButton}>
        <MailIcon />
      </IconButton>
    </div>
  );
};

export default MessageSender;
