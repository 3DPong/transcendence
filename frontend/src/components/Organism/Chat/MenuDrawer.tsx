import ChatContext from '@/context/ChatContext';
import GlobalContext from '@/context/GlobalContext';
import { Channel, ChatUser } from '@/types/chat';
import { API_URL } from '@/../config/backend';
import { FC, useContext, useEffect, useState } from 'react';
import MenuFooter from '../../Molecule/Chat/Menu/MenuFooter';
import MenuList from '../../Molecule/Chat/Menu/MenuList';
import ChannelSetting from './ChannelSetting';
import { useNavigate } from 'react-router-dom';
import { useError } from '@/context/ErrorContext';

interface MenuDrawerProps {
  open: boolean;
  users: ChatUser[];
  setUsers: (users: ChatUser[]) => void;
  handleClose: () => void;
  channel: Channel;
}

const MenuDrawer: FC<MenuDrawerProps> = ({ open, users, setUsers, handleClose, channel }) => {
  const [settingOpen, setSettingOpen] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);
  const { myRole, banList, muteList } = useContext(ChatContext);
  const { channels, setChannels, loggedUserId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { handleError } = useError();

  const isAdmin = myRole === "owner" || myRole === "admin";

  const banUsers = users.filter((user) => user.id in banList);

  // console.log("Drawer m=> ", muteList);
  // console.log("Drawer b=> ", banList);

  async function leaveChannel() {
    const response = await fetch(API_URL + '/chat/' + channel.id + '/out', {
      method: 'PUT',
    });
    if (!response.ok) {
      const errorData = await response.json();
      handleError('Leave Channel', errorData.message);
      return;
    }
    setChannels(channels.filter((_channel) => _channel.id !== channel.id));
    navigate('/channels', { replace: true });
  }

  return (
    <>
      <div
        className={` border border-gray-300 absolute top-0 right-0
          h-full w-72 bg-gray-50 z-50 transform duration-500 ease-in-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col w-full h-full">
          <div
            className=" flex-1 h-full overflow-y-auto
              scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
            onScroll={(event) => {
              setScrollY(event.currentTarget.scrollTop);
            }}
          >
            {settingOpen ? (
              <ChannelSetting
                handleClose={() => setSettingOpen(false)}
                channel={channel}
                userList={users}
                setUserList={setUsers}
              />
            ) : (
              <>
                <MenuList
                  title="User List"
                  titleColor={'black'}
                  users={users.filter((user) => user.deleted_at === null)}
                  scrollY={scrollY}
                />
                {isAdmin && <MenuList title="Ban List" titleColor={'black'} users={banUsers} scrollY={scrollY} />}
              </>
            )}
          </div>
          <div className="flex-shrink-0 h-50">
            {channel.type !== 'dm' && (
              <MenuFooter
                handleLeave={leaveChannel}
                handleSetting={() => {
                  setSettingOpen(!settingOpen);
                }}
                settingOpen={settingOpen}
              />
            )}
          </div>
        </div>
      </div>
      {open && <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 z-40" onClick={handleClose} />}
    </>
  );
};

export default MenuDrawer;
