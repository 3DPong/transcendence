import { User } from "@/types/chat";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { FC } from "react";

interface InviteListProps {
  users: User[];
  invitedUsers: string[];
  setInvitedUsers: (user: string[]) => void;
};

const InviteList : FC<InviteListProps> = ({users, invitedUsers, setInvitedUsers}) => {
  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="user-list-label">선택</InputLabel>
      <Select
        labelId="user-list-label"
        multiple
        value={invitedUsers}
        onChange={(event) => setInvitedUsers(event.target.value as string[])}
        sx={{ minWidth: 200 }}
      >
        {
          users.map(user => (
            <MenuItem key={user.userId} value={user.userId}>{user.nickname}</MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
};

export default InviteList;