
import {useState} from 'react';
import ImageUpload from "@/components/Molecule/ImageUpload";
import {LoadingButton} from "@mui/lab";
import {TextFieldWrapper} from "./SignUp";
import * as API from "@/api/API";
import {useError} from "@/context/ErrorContext";
import {useNavigate} from "react-router";
import { MuiOtpInput } from 'mui-one-time-password-input'

export function Auth2FaInput() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const { handleError } = useError();
  const navigate = useNavigate();

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
          <h1>Enter OTP Token</h1>
          <MuiOtpInput length={6} value={token} onChange={handleChange} onComplete={handleSubmit} />
        </div>
      </div>
  );

  /*
  return (
      <div className=" w-screen h-screen flex justify-center items-center">
        <div
            className=" border border-green-400
                      p-5
                      max-w-sm bg-white rounded-lg shadow-lg
                      flex flex-col"
        >
          <TextFieldWrapper
              value={token}
              onChange={setToken}
              type={'password'}
              label={'OTP Token'}
          />
          <LoadingButton
              loading={isLoading}
              sx={{ marginTop: 2 }}
              variant="outlined"
              onClick={handleSubmit}
          >
            Submit
          </LoadingButton>
        </div>
      </div>
  );
*/
}