import { FC } from "react";
import { ClickAwayListener, MenuItem, MenuList, Paper } from '@mui/material';

interface AvatarPopperProps {
  isOpen: boolean;
  handleClose: () => void;
  targetId : number;
  position: {
    top: number;
    left: number;
  }
};

const AvatarPopper : FC<AvatarPopperProps> = ({isOpen, handleClose, targetId, position}) => {

  function handleBanClick(id: number) {
    console.log(id + " is bann");
    handleClose();
  }
  function handleKickClick(id: number) {
    console.log(id + " is kick");
    handleClose();
  }
  function handleMuteClick(id: number) {
    console.log(id + " is mute");
    handleClose();
  }

  return (
    <>
    { isOpen && (
      <div
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          zIndex: 2
        }}
      >
        <ClickAwayListener onClickAway={handleClose} >
          <Paper>
            <MenuList>
              <MenuItem className="flex items-center p-2 hover:bg-gray-100" onClick={()=>{handleBanClick(targetId);}}>
                Ban
              </MenuItem>
              <MenuItem className="flex items-center p-2 hover:bg-gray-100" onClick={()=>{handleKickClick(targetId);}}>
                Kick
              </MenuItem>
              <MenuItem className="flex items-center p-2 hover:bg-gray-100" onClick={()=>{handleMuteClick(targetId);}}>
                Mute
              </MenuItem>
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </div>
    )}
    </>
  );
};

export default AvatarPopper;