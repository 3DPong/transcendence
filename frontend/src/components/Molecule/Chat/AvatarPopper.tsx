import { FC, useEffect, useRef, useState, useContext } from "react";
import { ClickAwayListener, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import ChatContext from "@/context/ChatContext";
import { ChatUser } from "@/types/chat";

interface AvatarPopperProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  target : ChatUser;
  scrollY : number;
};

const AvatarPopper : FC<AvatarPopperProps> = ({anchorEl, handleClose, target, scrollY}) => {
  const [muteTime, setMuteTime] = useState("10");
  const [banTime, setBanTime] = useState("10");
  const openScrollY = useRef<number>(scrollY);
  const open = Boolean(anchorEl);
  const { isAdmin, muteList, banList } = useContext(ChatContext);
  const isTargetMuted = muteList.includes(target.id);
  const isTargetBanned = banList.find((u)=>(u.id === target.id)) !== undefined;

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
  }

  useEffect(() => {
    if (scrollY != openScrollY.current) handleClose();
  }, [scrollY]);

  // 여기선 보내기만하고 상태 변경은 최상단에서 
  function handleProfileClick(id: number) {
    console.log(id + " is profile");
    handleClose();
  }
  function handleDMClick(id: number) {
    console.log(id + " is DM");
    handleClose();
  }
  function handleBanClick(id: number, minute: number) {
    console.log(id + " is bann");
    handleClose();
  }
  function handleUnBanClick(id: number) {
    console.log(id + " is Unbann");
    handleClose();
  }
  function handleMuteClick(id: number, minute: number) {
    console.log(id + ` is ${minute}m mute`);
    handleClose();
  }
  function handleUnMuteClick(id: number) {
    console.log(id + " is Unmute");
    handleClose();
  }
  function handleKickClick(id: number) {
    console.log(id + " is kick");
    handleClose();
  }
  function handleGrantClick(id: number) {
    console.log(id + " is Grant");
    handleClose();
  }
  function handleRevokeClick(id: number) {
    console.log(id + " is Revoke");
    handleClose();
  }

  const modifiers = [
    {
      name: "offset",
      options: {
        offset: [12, 0],
      },
    },
  ];

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
              key={6}
              sx={menuItemStyles}
              onClick={() => {
                handleProfileClick(targetId);
              }}
            >
              <MenuItem key={1} sx={menuItemStyles} onClick={()=>{handleProfileClick(target.id);}}>
                See Profile
              </MenuItem>
              <MenuItem key={2} sx={menuItemStyles} onClick={()=>{handleDMClick(target.id);}}>
                Send DM
              </MenuItem>
              { isAdmin && [
                  <MenuItem key={3} sx={[menuItemStyles, adminItemStyles]}
                    onClick={()=>{handleKickClick(target.id);}}>
                    Kick
                  </MenuItem>,
                  isTargetMuted ? 
                  <MenuItem key={4} sx={[menuItemStyles, adminItemStyles]}
                    onClick={()=>{handleUnMuteClick(target.id);}}
                  >
                    UnMute
                  </MenuItem> :
                  <MenuItem key={5} sx={[menuItemStyles, adminItemStyles]}>
                    <input type="text" maxLength={6}
                      style={{
                        width:60,
                        textAlign: "right",
                        paddingRight: "4px"
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
                    <div style={{paddingLeft:'2px'}}
                      onClick={()=>{handleMuteClick(target.id, Number(muteTime));}}
                    >
                      m Mute
                    </div>
                  </MenuItem>,
                  isTargetBanned ?
                  <MenuItem key={6} sx={[menuItemStyles, adminItemStyles]}
                    onClick={()=>{handleUnBanClick(target.id);}}
                  >
                    UnBan
                  </MenuItem> :
                  <MenuItem key={7} sx={[menuItemStyles, adminItemStyles]}>
                    <input type="text" maxLength={6}
                      style={{
                        width:60,
                        textAlign: "right",
                        paddingRight: "4px"
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
                    <div style={{paddingLeft:'2px'}}
                      onClick={()=>{handleBanClick(target.id, Number(banTime));}}
                    >
                      m Ban
                    </div>
                  </MenuItem>,
                  target.role === "user" ?
                  <MenuItem key={8} sx={[menuItemStyles, adminItemStyles]}
                    onClick={()=>{handleGrantClick(target.id);}}
                  >
                    Grant Admin
                  </MenuItem> :
                  <MenuItem key={9} sx={[menuItemStyles, adminItemStyles]}
                    onClick={()=>{handleRevokeClick(target.id);}}
                  >
                    Revoke Admin
                  </MenuItem>,
                ]}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
  );
};

export default AvatarPopper;
