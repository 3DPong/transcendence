import React from 'react';
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

interface templateProps {
  organism: ReactJSXElement;
}


const ChatTemplate2: React.FC<templateProps> = ({organism}) => {
  return (
    <div className=" absolute left-80 top-0 w-96 h-96 flex flex-col">
      {organism}
    </div>
  );
};

export default ChatTemplate2;