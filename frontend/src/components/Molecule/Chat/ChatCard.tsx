
import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { Room } from '@/types/chat';

interface ChatCardProps {
  imgURL?: string;
  chat: Room;
  isLoading?: boolean; // for skeleton
};

const SkeletonChatCard : React.FC = () => {
  return (
    <>
      <ListItemAvatar>
        <Skeleton variant="circular" animation="wave">
          <Avatar />
        </Skeleton>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Skeleton 
            animation="wave" 
            height={10} 
            width="40%"
            style={{ marginBottom:6, marginTop:6 }}
          />
        }
        secondary={
          <Skeleton 
            animation="wave" 
            height={10} 
            width="80%"
          />
        }
      />
    </>
  );
}

const LoadedCard : React.FC<ChatCardProps> = ({imgURL, chat}) => {
  return (
    <>
      <ListItemAvatar>
        <Avatar alt={chat.channelName}
          src={imgURL ? imgURL : "http://news.kbs.co.kr/data/fckeditor/new/image/2020/12/11/313731607645472653.jpg"} 
          sx={{
            borderRadius: '50%',
            bgcolor: imgURL ? 'transparent' : 'grey.300',
          }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={ chat.channelName }
        secondary= {
          <React.Fragment>
            <Typography
              sx={{ display: "inline" }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              additional data here
            </Typography>
          </React.Fragment>
        }
      />
    </>
  );
}

const ChatCard : React.FC<ChatCardProps> = ({imgURL, chat, isLoading}) => {
  return (
    <ListItem alignItems="flex-start" disablePadding>
      { isLoading ? <SkeletonChatCard/> : <LoadedCard imgURL={imgURL} chat={chat}/> }
    </ListItem>
  );
};

export default ChatCard;