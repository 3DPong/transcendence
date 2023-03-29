import { ChatUser } from "@/types/chat";
import { FC, useState } from "react";
import MenuFooter from "../../Molecule/Chat/Menu/MenuFooter";
import MenuList from "../../Molecule/Chat/Menu/MenuList";
import ChannelSetting from "./ChannelSetting";

interface MenuDrawerProps {
  open : boolean;
  handleClose : () => void;
  userlist: ChatUser[];
  banlist: ChatUser[];
  isAdmin: boolean;
};

const MenuDrawer : FC<MenuDrawerProps> = ({open, handleClose, userlist, banlist, isAdmin}) => {
  const [settingOpen, setSettingOpen] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  return (
    <>
      <div
        className={` border border-gray-200 absolute top-0 right-0 h-full w-72 bg-gray-100 z-50 transform duration-500 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col w-full h-full">
          <div className=" flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
            onScroll={(event)=>{setScrollY(event.currentTarget.scrollTop)}}
          >
            {
              settingOpen ? <ChannelSetting handleClose={()=>setSettingOpen(false)}/> :
              <>
                <MenuList title="참여 유저 리스트" users={userlist} scrollY={scrollY} muteList={[2,4,5]}/>
                {isAdmin && <MenuList title="밴 리스트" users={banlist} scrollY={scrollY} muteList={[]}/> }
              </>
            }
          </div>
          <div className="flex-shrink-0 h-50">
            <MenuFooter handleLeave={()=>{}} handleSetting={()=>{setSettingOpen(!settingOpen)}}/>
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