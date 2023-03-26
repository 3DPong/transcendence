import { FC } from "react";
import ExitIcon from '@mui/icons-material/ExitToApp';
import CogIcon from '@mui/icons-material/Settings';

interface MenuFooterProps {

};

const MenuFooter : FC<MenuFooterProps> = ({}) => {
  return (
    <div className="bottom-0 w-full bg-white border-t border-gray-300 px-4 py-2 flex justify-between">
      <button className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none">
        <ExitIcon className="h-5 w-5 mr-2" />
        Leave Room
      </button>
      <button className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none">
        <CogIcon className="h-5 w-5 mr-2" />
      </button>
    </div>
  );
}

export default MenuFooter;