import { ChatUser } from "@/types/chat";
import { IconButton, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from "@mui/material";
import { FC } from "react";
import AvatarSet from "../AvatarSet";
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface UserCardProps {
  user : ChatUser;
  scrollY : number;
};

const UserCard : FC<UserCardProps> = ({user, scrollY}) => {

  return (
    <div className="pr-4">
      <ListItem>
        <ListItemAvatar>
          <AvatarSet user={user} scrollY={scrollY} />
        </ListItemAvatar>
        <ListItemText title={user.nickname} primaryTypographyProps={{ noWrap: true }} primary={user.nickname} />
        <ListItemSecondaryAction>
          <IconButton style={{color: 'darkorange'}} disabled edge="end" aria-label="mute">
            <VolumeOffIcon/>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </div>
  );
};

export default UserCard;