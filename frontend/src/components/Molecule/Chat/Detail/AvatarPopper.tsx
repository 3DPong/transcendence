import { FC, useEffect } from "react";
import { ClickAwayListener, MenuItem, MenuList, Paper, Popper } from '@mui/material';

interface AvatarPopperProps {
  anchorEl : HTMLElement | null;
  handleClose: () => void;
  targetId : number;
  scrollY : number;
};

const AvatarPopper : FC<AvatarPopperProps> = ({anchorEl, handleClose, targetId, scrollY}) => {
  const open = Boolean(anchorEl);
  const isAdmin = true;
  const isMuted = false;
  const isBanned = false;

  const menuItemStyles = {
    fontSize: 'small',
    padding: '4px',
    paddingLeft: '10px',
    paddingRight: '10px',
    '&:hover': {
      textDecoration: 'underline',
    },
  };

  useEffect(() => {
    open && handleClose();
  }, [scrollY]);

  function handleProfileClick(id: number) {
    console.log(id + " is profile");
    handleClose();
  }
  function handleBanClick(id: number) {
    console.log(id + " is bann");
    handleClose();
  }
  function handleUnBanClick(id: number) {
    console.log(id + " is Unbann");
    handleClose();
  }
  function handleMuteClick(id: number) {
    console.log(id + " is mute");
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

  const modifiers = [
    {
      name: 'offset',
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
          zIndex: 2,
        }}
        placement="bottom-start"
        modifiers={modifiers}
      >
        <ClickAwayListener onClickAway={handleClose} >
          <Paper>
            <MenuList
              disablePadding
              className="border-gray-700 bg-slate-100 text-slate-800"
            >
              <MenuItem sx={menuItemStyles} onClick={()=>{handleProfileClick(targetId);}}>
                See Profile
              </MenuItem>
              { isAdmin && [
                  isMuted ? 
                  <MenuItem key={1} sx={menuItemStyles} onClick={()=>{handleUnMuteClick(targetId);}}>
                    UnMute
                  </MenuItem> :
                  <MenuItem key={2} sx={menuItemStyles} onClick={()=>{handleMuteClick(targetId);}}>
                    Mute
                  </MenuItem>,
                  isBanned ?
                  <MenuItem key={3} sx={menuItemStyles} onClick={()=>{handleUnBanClick(targetId);}}>
                    UnBan
                  </MenuItem> :
                  <MenuItem key={4} sx={menuItemStyles} onClick={()=>{handleBanClick(targetId);}}>
                    Ban
                  </MenuItem>,
                  <MenuItem key={5} sx={menuItemStyles} onClick={()=>{handleKickClick(targetId);}}>
                    Kick
                  </MenuItem>,
                ]}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
  );
};

export default AvatarPopper;