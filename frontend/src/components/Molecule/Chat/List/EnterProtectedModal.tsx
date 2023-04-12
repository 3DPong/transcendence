import { FC, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, styled } from "@mui/material";
import { Channel } from "@/types/chat";
import { TextField } from "@/components/Molecule/Chat/TextField";

interface EnterProtectedModalProps {
  channel: Channel | undefined;
  isModalOpen: boolean;
  setIsModalOpen: (tf: boolean) => void;
  joinChannel: (id: number, password: string | null) => void;
}

const EnterProtectedModal: FC<EnterProtectedModalProps> = ({ channel, isModalOpen, setIsModalOpen, joinChannel }) => {
  const CustomDialogTitle = styled(DialogTitle)({
    maxWidth: 300,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  });

  const [password, setPassword] = useState("");

  const handleJoin = () => {
    channel && joinChannel(channel.id, password);
    setIsModalOpen(false);
    setPassword("");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPassword("");
  };

  return (
    <Dialog open={isModalOpen} onClose={handleModalClose}>
      <CustomDialogTitle title={channel ? channel.title : ""}>{channel ? channel.title : ""}</CustomDialogTitle>
      <DialogContent>
        <TextField
          type="password"
          label="입장 비밀번호 입력"
          state={password}
          setState={setPassword}
          placeholder="비밀번호를 입력하세요"
        />
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
