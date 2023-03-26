import { FC, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, styled } from '@mui/material';
import { Channel } from '@/types/chat';
import { TextField } from '@/components/Molecule/Chat/TextField';

interface EnterProtectedModalProps {
  channel: Channel | undefined;
  isModalOpen : boolean;
  setIsModalOpen : (tf: boolean) => void;
  joinChat : (id:number) => void;
};

const EnterProtectedModal : FC<EnterProtectedModalProps> = ({channel, isModalOpen, setIsModalOpen, joinChat}) => {
  const CustomDialogTitle = styled(DialogTitle)({
    maxWidth: 300, // 최대 너비
    textOverflow: 'ellipsis', // 일정 이상이 되면 ...으로 표시
    whiteSpace: 'nowrap', // 줄바꿈 없이 표시
    overflow: 'hidden', // 넘치는 부분 가리기
  });

  const [password, setPassword] = useState('');

  const handleJoin = () => {
    //onJoin(channelId, password);
    channel && joinChat(channel.channelId);
    setIsModalOpen(false);
    setPassword('');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPassword('');
  };

  return (
    <Dialog open={isModalOpen} onClose={handleModalClose}>
      <CustomDialogTitle title={channel ? channel.channelName : ""}>
        {channel ? channel.channelName : ""}
      </CustomDialogTitle>
      <DialogContent>
        <TextField type="password" label="입장 비밀번호 입력" state={password} setState={setPassword} placeholder="비밀번호를 입력하세요" />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>취소</Button>
        <Button onClick={handleJoin} variant="contained" color="primary">
          입장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnterProtectedModal;