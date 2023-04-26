import React, { useContext, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { ChannelType, defaultThumbnail, User } from '@/types/chat';
import CreateChatTypeToggle from '@/components/Molecule/Chat/Create/ChatTypeToggle';
import InviteList from '@/components/Molecule/Chat/InviteList';
import ImageUpload from '@/components/Molecule/ImageUpload';

import { TextField } from '@/components/Molecule/Chat/TextField';
import { API_URL, ORIGIN_URL } from '@/../config/backend';
import { useNavigate } from 'react-router';
import GlobalContext from '@/context/GlobalContext';
import { useAlert } from '@/context/AlertContext';
import { uploadImageToServer } from '@/api/API';

interface CreateChatRoomProps {
  //onCreate: (title: string, type: ChatType, password: string, invitedUsers: string[]) => void;
}

const CreateChatRoom: React.FC<CreateChatRoomProps> = ({}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ChannelType>('public');
  const [password, setPassword] = useState('');
  const [inviteUsers, setInviteUsers] = useState<User[]>([]);
  const [thumbnail, setThumbnail] = useState<string>('');
  const navigate = useNavigate();
  const { channels, setChannels, loggedUserId } = useContext(GlobalContext);
  const { handleAlert } = useAlert();
  const minLen = 1;

  const handleCreate = () => {
    async function createChat() {
      if (title.length < minLen) {
        handleAlert('Channel Setting', `채팅방 제목은 ${minLen}자 이상이어야 합니다.`);
        return;
      }
      if (type === 'protected' && password.length < minLen) {
        handleAlert('Channel Setting', `비밀번호는 ${minLen}자 이상이어야 합니다.`);
        return;
      }

      let imageToSubmit: string | undefined;
      if (thumbnail) {
        const serverSideImageUrl = await uploadImageToServer(handleAlert, thumbnail);
        if (serverSideImageUrl) {
          console.log("[DEV] uploadImage Success");
          imageToSubmit = ORIGIN_URL + serverSideImageUrl;
        }
      }

      const response = await fetch(API_URL + '/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: title,
          password: password === '' ? null : password,
          type: type,
          inviteList: inviteUsers.map((user) => user.id),
          thumbnail_url: imageToSubmit || defaultThumbnail,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        handleAlert('Channel Create', error.message);
        return;
      }

      const createChannel = await response.json();
      setChannels([
        {
          id: createChannel.channel_id,
          title: createChannel.name,
          type: createChannel.type,
          owner: {
            id: createChannel.owner.user_id,
            nickname: createChannel.owner.nickname,
            profile: createChannel.owner.profile_url,
          },
        },
        ...channels,
      ]);
      navigate('/channels');
    }
    createChat();
  };

  return (
    <>
      <Container sx={{ pb: 2, pt: 2 }} maxWidth="sm" className={'border border-gray-200'}>
        <Typography variant="h6" component="h3" gutterBottom>
          채팅방 생성
        </Typography>
        <ImageUpload width={200} height={200} thumbnail={thumbnail} setThumbnail={setThumbnail} />
        <Box component="form" sx={{ mt: 1 }}>
          <div className="mb-6">
            <TextField
              label="채팅방 제목"
              placeholder="제목을 입력하세요"
              state={title}
              setState={setTitle}
              helperText={title.length < minLen ? `${minLen}글자 이상 입력하세요` : ''}
            />
          </div>
          <CreateChatTypeToggle type={type} setType={setType} />
          {'protected' === type && (
            <div className="mb-6">
              <TextField
                type="password"
                label="비밀번호"
                state={password}
                setState={setPassword}
                placeholder="비밀번호를 입력하세요"
                helperText={password.length < minLen ? `${minLen}글자 이상 입력하세요` : ''}
              />
            </div>
          )}
          <InviteList inviteUsers={inviteUsers} setInviteUsers={setInviteUsers} />

          <Button fullWidth variant="contained" color="primary" onClick={handleCreate}>
            채팅방 생성
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default CreateChatRoom;
