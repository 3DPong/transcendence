import React, { useContext, useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { ChannelType, defaultThumbnail, User } from "@/types/chat";
import CreateChatTypeToggle from "@/components/Molecule/Chat/Create/ChatTypeToggle";
import SearchTextField from "@/components/Molecule/SearchTextField";
import CreateChatInviteList from "@/components/Molecule/Chat/Create/InviteList";
import ImageUpload from "@/components/Molecule/ImageUpload";

import { TextField } from "@/components/Molecule/Chat/TextField";
import { API_URL } from "@/../config/backend";
import { useNavigate } from "react-router";
import GlobalContext from "@/context/GlobalContext";
import { useError } from "@/context/ErrorContext";

interface CreateChatRoomProps {
  //onCreate: (title: string, type: ChatType, password: string, invitedUsers: string[]) => void;
}

const CreateChatRoom: React.FC<CreateChatRoomProps> = ({}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ChannelType>("public");
  const [password, setPassword] = useState("");
  const [searchString, setSearchString] = useState("");
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>(defaultThumbnail);
  const navigate = useNavigate();
  const { channels, setChannels } = useContext(GlobalContext);
  const { handleError } = useError();

  function searchButtonClick() {
    async function searchUser() {
      const response = await fetch(API_URL + "/chat/users/" + searchString);
      if (!response.ok) {
        const error = await response.json();
        handleError("Search User", error.message);
        return;
      }
      const fetchUsers = await response.json();
      setSearchUsers(
        fetchUsers.map((u: any) => ({
          id: u.user_id,
          nickname: u.nickname,
          profile: "",
        }))
      );
    }
    searchUser();
  }

  function searchButtonKeyup(event: React.KeyboardEvent) {
    if (event.key === "Enter") searchButtonClick();
  }

  const handleCreate = () => {
    async function createChat() {
      const response = await fetch(API_URL + "/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title,
          password: password === "" ? null : password,
          type: type,
          inviteList: invitedUsers,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        handleError("Channel Create", error.message);
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
      navigate("/channels");
    }
    createChat();
  };

  return (
    <>
      <Container sx={{ pb: 2, pt: 2, border: 1 }} maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          채팅방 생성
        </Typography>
        <ImageUpload width={200} height={200} thumbnail={thumbnail} setThumbnail={setThumbnail} />
        <Box component="form" sx={{ mt: 1 }}>
          <div className="mb-6">
            <TextField state={title} label="채팅방 제목" placeholder="제목을 입력하세요" setState={setTitle} />
          </div>
          <CreateChatTypeToggle type={type} setType={setType} />
          {"protected" === type && (
            <div className="mb-6">
              <TextField
                type="password"
                label="비밀번호"
                state={password}
                setState={setPassword}
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          )}

          <div className=" m-0 p-0">
            <label className="inline-block mb-2 text-gray-700 form-label">초대 리스트</label>
            <SearchTextField
              placeholder={"초대할 유저 검색"}
              state={searchString}
              setState={setSearchString}
              onClick={searchButtonClick}
              onKeyUp={searchButtonKeyup}
            />
          </div>

          <Box sx={{ mt: 2 }}>
            <CreateChatInviteList users={searchUsers} invitedUsers={invitedUsers} setInvitedUsers={setInvitedUsers} />
          </Box>

          <Button fullWidth variant="contained" color="primary" onClick={handleCreate}>
            채팅방 생성
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default CreateChatRoom;
