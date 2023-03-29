import ChatTypeToggle from "@/components/Molecule/Chat/Create/ChatTypeToggle";
import ImageUpload from "@/components/Molecule/ImageUpload";
import { TextField } from "@/components/Molecule/Chat/TextField";
import { Box, Button, Container, Typography } from "@mui/material";
import { FC, useState } from "react";
import { ChannelType } from "@/types/chat";

interface ChannelSettingProps {
  handleClose : () => void;
};

const ChannelSetting : FC<ChannelSettingProps> = ({handleClose}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ChannelType>("public");
  const [password, setPassword] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");

  function handleCreate() {
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
        <Button fullWidth variant="contained" color="primary" onClick={handleCreate}>
          설정 저장
        </Button>
      </Box>
    </Container>
  );
};

export default ChannelSetting;