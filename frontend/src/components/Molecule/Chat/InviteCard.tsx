import { User } from '@/types/chat';
import { Avatar } from '@mui/material';
import { FC } from 'react';

interface InviteCardProps {
  user: User;
  onClick: () => void;
}

const InviteCard: FC<InviteCardProps> = ({ user, onClick }) => {
  return (
    <div className="inline-flex flex-col items-center cursor-pointer" onClick={onClick}>
      <Avatar
        alt={user.nickname}
        src={user.profile}
        sx={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: '2px solid black',
        }}
      />
      <div className="text-center m-1 text-sm font-medium truncate w-12">{user.nickname}</div>
    </div>
  );
};

export default InviteCard;
