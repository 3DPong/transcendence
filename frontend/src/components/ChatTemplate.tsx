import React from 'react';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { Outlet } from 'react-router-dom';

interface templateProps {
  organism: ReactJSXElement;
}

const ChatTemplate: React.FC<templateProps> = ({ organism }) => {
  return (
    <div>
      <div className="absolute shadow-lg left-80 top-0 w-96 h-full overflow-hidden bg-white">
        {organism}
      </div>
      <Outlet />
    </div>
  );
};

export default ChatTemplate;
