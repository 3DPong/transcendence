import React from "react";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

interface templateProps {
  organism: ReactJSXElement;
}

const ChatTemplate: React.FC<templateProps> = ({ organism }) => {
  return <div className="absolute shadow-lg left-80 top-0 w-96 h-full overflow-hidden">{organism}</div>;
};

export default ChatTemplate;
