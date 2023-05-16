import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router';
import * as API from '@/api/API';
import { useAlert } from '@/context/AlertContext';
import { Mail } from '@mui/icons-material';
import { Container } from '@mui/material';

export default function SignInWithEmailDialog() {

  const navigate = useNavigate();
  const {handleAlert} = useAlert();

  const [open, setOpen] = React.useState(true);
  const [isMailSent, setIsMailSent] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [verifyCode, setVerifyCode] = React.useState("");

  const [emailSentCode, setEmailSentCode] = React.useState("");

  const handleClose = (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason && reason === 'backdropClick') return; // 외곽 영역 클릭시 꺼지지 않도록 설정.
    setOpen(false);
    navigate('/signin');
  };
  
  const handleSendMail = async () => {
    // 1. send mail api
    const verifyCodeOnServer = await API.sendEmailVerifyCode(handleAlert, email);
    if (verifyCodeOnServer) {
      setVerifyCode(verifyCodeOnServer);
      setIsMailSent(true);
    }
  }

  const handleSendSignIn = async () => {
    // 1. send verifyCode, emailSentCode
    const redirectURL = await API.verifyEmail(handleAlert, email, emailSentCode, verifyCode);
    console.log("[DEV] server's redirect url is ", redirectURL);
    setOpen(false);
    navigate(redirectURL);
  }

  return (
    <div>
      <Container maxWidth="lg">
        <Dialog open={open} onClose={handleClose}>
          {(!isMailSent) ? (
            <>
              <DialogTitle>Sign in with your email</DialogTitle>
              <DialogContent>
                <DialogContentText color={"primary"}>
                   Please enter your email address here. <br/>
                   We will send you a temporary sign in code.
                </DialogContentText>
                <TextField
                  color='primary'
                  autoFocus
                  required
                  margin="normal"
                  id="name"
                  value={email}
                  label="Email Address"
                  type="email"
                  fullWidth
                  variant="outlined"
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button variant='contained' onClick={handleSendMail} disabled={!email.length /* 일단 빈 칸일경우 true로 (임시용) */}>
                  인증코드 보내기
                </Button>
                <Button onClick={handleClose}>close</Button>
              </DialogActions>
            </>
          ) : ( // if mail has been sent successfuly
            <>
              <DialogTitle>Enter Verify Code</DialogTitle>
              <DialogContent>
                <DialogContentText color={"info"}>
                  We just sent you a temporary sign in code. <br/>
                  Please check your inbox and paste the sign in code below.
                </DialogContentText>
                <TextField
                  color='info'
                  autoFocus
                  required
                  margin="normal"
                  id="name"
                  value={emailSentCode}
                  label="Verify Code"
                  type="text"
                  fullWidth
                  variant="outlined"
                  onChange={(event) => {
                    setEmailSentCode(event.target.value);
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button variant='contained' onClick={handleSendSignIn} disabled={!emailSentCode.length /* 일단 빈 칸일경우 true로 (임시용) */}>
                  제출하기
                </Button>
                <Button onClick={handleClose}>close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </div>
  );
}