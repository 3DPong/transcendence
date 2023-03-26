import { User } from "@/types/chat";
import { IconButton, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from "@mui/material";
import { FC } from "react";
import AvatarSet from "../AvatarSet";
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface UserCardProps {
  user : User;
  scrollY : number;
};

const UserCard : FC<UserCardProps> = ({user, scrollY}) => {

  return (
    <div className="pr-4">
      <ListItem>
        <ListItemAvatar>
          <AvatarSet user={user} scrollY={scrollY} />
        </ListItemAvatar>
        <ListItemText title={user.nickname} primary={user.nickname} />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="mute">
            <VolumeOffIcon/>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </div>
  );
};

export default UserCard;