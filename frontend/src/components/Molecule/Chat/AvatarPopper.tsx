import { FC, useEffect, useRef, useState, useContext } from 'react';
import { ClickAwayListener, MenuItem, MenuList, Paper, Popper } from '@mui/material';
import ChatContext from '@/context/ChatContext';
import { ChatUser } from '@/types/chat';
import { useSocket } from '@/context/SocketContext';
import { useParams } from 'react-router';
import { API_URL } from '@/../config/backend';
import GlobalContext from '@/context/GlobalContext';
import { useError } from '@/context/ErrorContext';

interface AvatarPopperProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  target: ChatUser;
  scrollY: number;
}

const AvatarPopper: FC<AvatarPopperProps> = ({ anchorEl, handleClose, target, scrollY }) => {
  const [muteTime, setMuteTime] = useState('10');
  const [banTime, setBanTime] = useState('10');
  const openScrollY = useRef<number>(scrollY);
  const open = Boolean(anchorEl);
  const { myRole, muteList, setMuteList, banList, setBanList } = useContext(ChatContext);
  const isTargetMuted = target.id in muteList;
  const isTargetBanned = target.id in banList;

  const isAdmin = myRole ? ["owner", "admin"].includes(myRole) : false;

  const { chatSocket } = useSocket();
  const { channelId } = useParams();

  const { loggedUserId } = useContext(GlobalContext);

  const { handleError } = useError();

  const menuItemStyles = {
    fontSize: 'small',
    padding: '4px',
    paddingLeft: '10px',
    paddingRight: '10px',
    '&:hover': {
      textDecoration: 'underline',
      backgroundColor: '#c5cae9',
    },
    backgroundColor: '#e8eaf6',
  };

  const adminItemStyles = {
    backgroundColor: '#ffebee',
    '&:hover': {
      backgroundColor: '#ffcdd2',
    },
  };

  useEffect(() => {
    if (scrollY != openScrollY.current) handleClose();
  }, [scrollY]);

  // 여기선 보내기만하고 상태 변경은 최상단에서
  function handleProfileClick(id: number) {
    console.log(id + ' is profile');
    handleClose();
  }

  function handleDMClick(id: number) {
    console.log(id + ' is DM');
    async function fetchDM() {
      const response = await fetch(API_URL + '/chat/dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: id,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        handleError('Send DM', error.message);
        return;
      }
      const parse = await response.json();
      console.log(response);
    }
    fetchDM();
    handleClose();
  }

  function handleBanClick(id: number, minute: number) {
    console.log(id + ' is bann');
    chatSocket?.emit('ban-chat', {
      user_id: id,
      channel_id: channelId,
      end_at: new Date(Date.now() + minute * 60000),
    });
    //BanEvent가 Broadcast인 경우 활성화
    //setBanList([...banList, target]);
    handleClose();
  }
  function handleUnBanClick(id: number) {
    console.log(id + ' is Unbann');
    chatSocket?.emit('unban-chat', {
      user_id: id,
      channel_id: channelId,
    });
    //BanEvent가 Broadcast인 경우 활성화
    //setBanList(banList.filter((user)=>(user.id !== id)));
    handleClose();
  }
  function handleMuteClick(id: number, minute: number) {
    console.log(id + ` is ${minute}m mute`);
    chatSocket?.emit('mute-chat', {
      user_id: id,
      channel_id: channelId,
      end_at:  new Date(Date.now() + minute * 60000),
    });
    //MuteEvent가 Broadcast인 경우 활성화
    //setMuteList([...muteList, id]);
    handleClose();
  }
  function handleUnMuteClick(id: number) {
    console.log(id + ' is Unmute');
    chatSocket?.emit('mute-chat', {
      user_id: id,
      channel_id: channelId,
      end_at: new Date(0),
    });
    //MuteEvent가 Broadcast인 경우 활성화
    //setMuteList(muteList.filter((mid) => (mid !== id)));
    handleClose();
  }
  function handleKickClick(id: number) {
    console.log(id + ' is kick');
    chatSocket?.emit('kick-chat', {
      user_id: id,
      channel_id: channelId,
    });
    handleClose();
  }
  function handleGrantClick(id: number) {
    console.log(id + ' is Grant');
    async function fetchGrant() {
      const response = await fetch(API_URL + '/chat/'+ channelId +'/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: id,
          role: 'admin',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        handleError('Grant Admin', error.message);
        return;
      }
    }
    fetchGrant();
    handleClose();
  }
  function handleRevokeClick(id: number) {
    console.log(id + ' is Revoke');
    async function fetchRevoke() {
      const response = await fetch(API_URL + '/chat/'+ channelId +'/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: id,
          role: 'user',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        handleError('Revoke Admin', error.message);
        return;
      }
    }
    fetchRevoke();
    handleClose();
  }

  const modifiers = [
    {
      name: 'offset',
      options: {
        offset: [12, 0],
      },
    },
  ];

  const myPopper = loggedUserId === target.id;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      style={{
        zIndex: 200,
      }}
      placement="bottom-start"
      modifiers={modifiers}
    >
      <ClickAwayListener onClickAway={handleClose}>
        <Paper>
          <MenuList disablePadding className="border-gray-700 bg-slate-100 text-slate-800">
            <MenuItem
              key={1}
              sx={menuItemStyles}
              onClick={() => {
                handleProfileClick(target.id);
              }}
            >
              {myPopper ? 'View MyProfile' : 'View Profile'}
            </MenuItem>
            {!myPopper && (
              <MenuItem
                key={2}
                sx={menuItemStyles}
                onClick={() => {
                  handleDMClick(target.id);
                }}
              >
                Send DM
              </MenuItem>
            )}
            {!myPopper &&
              isAdmin && [
                isTargetBanned ? (
                  <div key={3}></div>
                ) : (
                  <MenuItem
                    key={3}
                    sx={[menuItemStyles, adminItemStyles]}
                    onClick={() => {
                      handleKickClick(target.id);
                    }}
                  >
                    Kick
                  </MenuItem>
                ),
                isTargetBanned ? (
                  <div key={4}></div>
                ) : isTargetMuted ? (
                  <MenuItem
                    key={4}
                    sx={[menuItemStyles, adminItemStyles]}
                    onClick={() => {
                      handleUnMuteClick(target.id);
                    }}
                  >
                    UnMute
                  </MenuItem>
                ) : (
                  <MenuItem key={4} sx={[menuItemStyles, adminItemStyles]}>
                    <input
                      type="text"
                      maxLength={6}
                      style={{
                        width: 60,
                        textAlign: 'right',
                        paddingRight: '4px',
                      }}
                      value={muteTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        const valueAsNumber = Number(value);
                        if (!isNaN(valueAsNumber)) {
                          setMuteTime(value);
                        }
                      }}
                    />
                    <div
                      style={{ paddingLeft: '2px' }}
                      onClick={() => {
                        handleMuteClick(target.id, Number(muteTime));
                      }}
                    >
                      m Mute
                    </div>
                  </MenuItem>
                ),
                isTargetBanned ? (
                  <MenuItem
                    key={5}
                    sx={[menuItemStyles, adminItemStyles]}
                    onClick={() => {
                      handleUnBanClick(target.id);
                    }}
                  >
                    UnBan
                  </MenuItem>
                ) : (
                  <MenuItem key={5} sx={[menuItemStyles, adminItemStyles]}>
                    <input
                      type="text"
                      maxLength={6}
                      style={{
                        width: 60,
                        textAlign: 'right',
                        paddingRight: '4px',
                      }}
                      value={banTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        const valueAsNumber = Number(value);
                        if (!isNaN(valueAsNumber)) {
                          setBanTime(value);
                        }
                      }}
                    />
                    <div
                      style={{ paddingLeft: '2px' }}
                      onClick={() => {
                        handleBanClick(target.id, Number(banTime));
                      }}
                    >
                      m Ban
                    </div>
                  </MenuItem>
                ),
                isTargetBanned ? (
                  <div key={6}></div>
                ) : target.role === 'user' ? (
                  <MenuItem
                    key={6}
                    sx={[menuItemStyles, adminItemStyles]}
                    onClick={() => {
                      handleGrantClick(target.id);
                    }}
                  >
                    Grant Admin
                  </MenuItem>
                ) : (
                  <MenuItem
                    key={6}
                    sx={[menuItemStyles, adminItemStyles]}
                    onClick={() => {
                      handleRevokeClick(target.id);
                    }}
                  >
                    Revoke Admin
                  </MenuItem>
                ),
              ]}
          </MenuList>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default AvatarPopper;
