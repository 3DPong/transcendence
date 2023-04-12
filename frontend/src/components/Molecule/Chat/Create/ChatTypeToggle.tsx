import { FC } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/lab';
import { FormControl } from '@mui/material';
import { ChannelType } from '@/types/chat';
import { Lock, LockOpen, Public } from '@mui/icons-material';

interface ChatTypeToggleProps {
  type: ChannelType;
  setType: (type: ChannelType) => void;
}

const ChatTypeToggle: FC<ChatTypeToggleProps> = ({ type, setType }) => {
  const handleTypeChange = (event: React.MouseEvent<HTMLElement>, value: ChannelType | null) => {
    return value && setType(value as ChannelType);
  };

  return (
    <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
      <label className="inline-block mb-2 text-gray-700 form-label">채팅방 타입</label>
      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={handleTypeChange}
        sx={{ justifyContent: 'center', borderRadius: 1 }}
      >
        <ToggleButton value="public" sx={{ borderRadius: 1, flexDirection: 'column' }}>
          <Public />
          Public
        </ToggleButton>
        <ToggleButton value="protected" sx={{ borderRadius: 1, flexDirection: 'column' }}>
          <LockOpen />
          Protected
        </ToggleButton>
        <ToggleButton value="private" sx={{ borderRadius: 1, flexDirection: 'column' }}>
          <Lock />
          Private
        </ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default ChatTypeToggle;
