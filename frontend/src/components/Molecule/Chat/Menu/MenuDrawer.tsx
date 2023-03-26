import { User } from "@/types/chat";
import { FC } from "react";
import MenuFooter from "./MenuFooter";
import MenuList from "./MenuList";

interface MenuDrawerProps {
  open : boolean;
  handleClose : () => void;
  userlist: User[];
  banlist: User[];
};

const MenuDrawer : FC<MenuDrawerProps> = ({open, handleClose, userlist, banlist }) => {
  return (
    <>
      <div
        className={` absolute top-0 right-0 h-full w-72 bg-gray-100 z-50 transform duration-500 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col w-full h-full">
          <div className=" flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200">
            <MenuList title="참여 유저 리스트" users={userlist}/>
            <MenuList title="밴 리스트" users={banlist}/>
          </div>
          <div className="flex-shrink-0 h-50">
            <MenuFooter />
          </div>
        </div>
      </div>
      { open && <div
            className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-40"
            onClick={handleClose}
          />
      }
    </>
  );
};

export default MenuDrawer;