
import {useState} from 'react';
import ImageUpload from "@/components/Molecule/ImageUpload";
import {LoadingButton} from "@mui/lab";
import {TextFieldWrapper} from "./SignUp";
import * as API from "@/api/API";
import {useError} from "@/context/ErrorContext";
import {useNavigate} from "react-router";
import { MuiOtpInput } from 'mui-one-time-password-input'
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Card, Typography } from '@mui/material';

export function Auth2FaInput() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleError } = useError();
  const navigate = useNavigate();

  const [token, setToken] = useState<string>('');

  const handleSubmit = () => {
    (async () => {
      // 1. 서버에 토큰 전송
      setIsLoading(true);
      const response = await API.submit2FaTokenToServer(handleError, token);
      setIsLoading(false);
      if (response) {
        console.log('[DEV] Login Success!');
        navigate('/'); // 2FA 인증 성공시 홈으로 이동.
      }
    })(/* IIFE */);
  };

  const handleChange = (newVal: string) => {
    setToken(newVal);
  }
  return (
      <div className=" w-screen h-screen flex justify-center items-center">
        <div
            className=" border border-green-400
                      p-5
                      max-w-sm bg-white rounded-lg shadow-lg
                      flex flex-col"
        >
          {/* OTP 입력창 */}
          <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              OTP Authentication
            </Typography>
            <MuiOtpInput length={6} value={token} onChange={handleChange} />
            <Button variant="outlined" size="medium" onClick={handleSubmit}>Submit</Button>
          </Card>
        </div>
      </div>
  );
}