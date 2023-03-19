import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";
import { ChatType, User } from "@/types/chat";
import CreateChatTypeToggle from "@/components/Molecule/Chat/Create/ChatTypeToggle";
import CreateChatPasswordField from "@/components/Molecule/Chat/Create/PasswordField";
import SearchTextField from "@/components/Molecule/SearchTextField";
import * as Dummy from "@/dummy/data";
import CreateChatInviteList from "@/components/Molecule/Chat/Create/InviteList";
import ImageUpload from "@/components/Molecule/ImageUpload";

import {TextFields as TextField} from "@/components/Molecule/TextFields_A";


interface CreateChatRoomProps {
  //onCreate: (title: string, type: ChatType, password: string, invitedUsers: string[]) => void;
}

const CreateChatRoom: React.FC<CreateChatRoomProps> = ({}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ChatType>("public");
  const [password, setPassword] = useState("");
  const [searchString, setSearchString] = useState("");
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>("");

  function searchButtonClick() {
    setSearchUsers(Dummy.dummy_users);
  }

  function searchButtonKeyup(event: React.KeyboardEvent) {
    if (event.key === 'Enter')
      searchButtonClick();
  }

  const handleCreate = () => {};

  return (
    <>
    <Container sx={{pb:2, pt:2}} maxWidth="sm" >
      <Typography variant="h4" component="h1" gutterBottom>
        채팅방 생성
      </Typography> 
      <ImageUpload thumbnail={thumbnail} setThumbnail={setThumbnail}/>
      <Box component="form" sx={{ mt: 1 }}>

        <TextField state={title} label={"채팅방 제목"} placeholder={"제목을 입력하세요"} setState={setTitle}/>
        <CreateChatTypeToggle type={type} setType={setType}/>
        <CreateChatPasswordField password={password} setPassword={setPassword} isVisible={"protected" === type}/>

        <div className=" m-0 p-0">
          <label className="inline-block mb-2 text-gray-700 form-label">
            초대 리스트
          </label>
          <SearchTextField placeholder={"초대할 유저 검색"} state={searchString} setState={setSearchString} onClick={searchButtonClick} onKeyUp={searchButtonKeyup} />
        </div>

        <Box sx={{mt:2}}>
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
