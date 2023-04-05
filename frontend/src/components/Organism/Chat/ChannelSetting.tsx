import ChatTypeToggle from "@/components/Molecule/Chat/Create/ChatTypeToggle";
import ImageUpload from "@/components/Molecule/ImageUpload";
import { TextField } from "@/components/Molecule/Chat/TextField";
import { Box, Button, Container, Typography } from "@mui/material";
import { FC, useContext, useEffect, useState } from "react";
import { Channel, ChannelType, ChatUser, User, defaultThumbnail } from "@/types/chat";
import GlobalContext from "@/context/GlobalContext";
import { API_URL } from "@/../config/backend";
import { useError } from "@/context/ErrorContext";
import InviteList from "@/components/Molecule/Chat/InviteList";
import ChatContext from "@/context/ChatContext";

interface ChannelSettingProps {
  handleClose : () => void;
  channel: Channel;
};

const ChannelSetting : FC<ChannelSettingProps> = ({handleClose, channel}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ChannelType>("none");
  const [password, setPassword] = useState("");
  const [thumbnail, setThumbnail] = useState<string>(""); 
  const [inviteUsers, setInviteUsers] = useState<User[]>([]); 

  const {setChannels} = useContext(GlobalContext);
  const {userList, setUserList} = useContext(ChatContext);
  const {handleError} = useError();

  useEffect(()=>{
    setTitle(channel.title);
    setType(channel.type);
    setThumbnail(channel.thumbnail || defaultThumbnail);
  }, [channel])

  function handleSave() {
    async function updateChannel() {
      const response = await fetch(API_URL + "/chat/" + channel.id + "/update", {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title,
          password: password === "" ? null : password,
          type: type,
          inviteList: inviteUsers.map((user)=>(user.id)),
          thumbnail_url: thumbnail,
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        handleError("Channel Save", errorData.message);
        return;
      }
      setChannels((draft) => {
        const target = draft.find((tchannel) => tchannel.id === channel.id);
        if (target) {
          target.title = title;
          target.thumbnail = thumbnail;
          target.type = type;
        }
      });

      function setUsersWithoutExist() {
        const newUserList = [...userList];
        for (const user of inviteUsers) {
          if (!newUserList.some((u) => u.id === user.id)) {
            const newUser: ChatUser = {
              ...user,
              role: "user",
              status: "none",
              deleted_at: null,
            };
            newUserList.push(newUser);
          }
        }
        setUserList(newUserList);
      }
      setUsersWithoutExist();
    }
    updateChannel();
    handleClose();
  }

  return (
    <Container sx={{ pb: 2, pt: 2 }} maxWidth="sm">
      <Typography variant="h6" component="h3" gutterBottom>
        채팅방 설정
      </Typography> 
      <ImageUpload width={100} height={100} thumbnail={thumbnail} setThumbnail={setThumbnail} />
      <Box component="form" sx={{ mt: 1 }}>
        <div className="mb-6">
          <TextField state={title} label="채팅방 제목" placeholder="제목을 입력하세요" setState={setTitle} />
        </div>
        <ChatTypeToggle type={type} setType={setType} />
        {"protected" === type &&
          <div className="mb-6">
            <TextField type="password" label="비밀번호" state={password} setState={setPassword} placeholder="비밀번호를 입력하세요" />
          </div>}

        <InviteList inviteUsers={inviteUsers} setInviteUsers={setInviteUsers}/>
        
        <Button fullWidth variant="contained" color="primary" onClick={handleSave}>
          설정 저장
        </Button>
      </Box>
    </Container>
  );
};

export default ChannelSetting;