/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SignUp.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/23 18:55:41 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/24 22:21:22 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import ImageUpload from "@/components/Molecule/ImageUpload";
import { useState, useEffect, useContext, useMemo } from "react";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import { LoadingButton } from "@mui/lab";
import TextField from '@mui/material/TextField';
import * as API from '@/api/API';
import GlobalContext from "@/context/GlobalContext";
import { useNavigate } from "react-router";
import * as Utils from "@/utils/Validator";

export interface TextFieldWrapperProps {
  value: string;
  onChange: (arg: string) => void;
  type?: string; // text or password... etc
  label?: string; // 이건 입력은 아니고, 단순 표시용 제목 (필드 제목)
  placeholder?: string; // 미입력시 기본으로 입력되는 내용 (초기값)
  disabled?: boolean; // Search 버튼 활성화 여부
  disabledHelperText?: string; // 오류시 표기할 내용.
}


function TextFieldWrapper(props: TextFieldWrapperProps) {
  {/* https://mui.com/material-ui/react-text-field/ */}
  return (
      <TextField
          sx={{ flex: 1 }} // 가득 채우기
          id="standard-basic"
          variant="standard"
          type={props.type}
          label={props.label}
          onChange={(event) => {
            props.onChange(event.target.value);
          }}
          placeholder={props.placeholder}
          error={props.disabled}
          helperText={props.disabled ? props.disabledHelperText : ""} // 에러일 때만 표시
          required={true}
        />
  );
}

export function SignUp() {

  const { setLoggedUserId } = useContext(GlobalContext);
  const [ imageFile, setImageFile ] = useState<string>("");
  const [ nickname, setNickname ] = useState<string>("");
  const [ submitDisabled, setSubmitDisabled ] = useState<boolean>(false);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  const navigate = useNavigate();
  
  const WIDTH = 250;
  const HEIGHT = WIDTH;

  const handleSubmit = () => {
    if (submitDisabled) return;
    (async () => {
      console.log("handle submit");
      // 1. 서버에 가입 요청.
      setIsLoading(true);
      const response = await API.requestSignUp( nickname, imageFile );
      setIsLoading(false);
      // 2. 만약 요청 status가 정상이 아니라면...?
          // ...??

      // 3. Success 201 : 받은 데이터로 전역 state 설정.
      setLoggedUserId(response.user_id);

      // 4. 이제 userId 세팅이 됬으니 "home" 으로 이동.
      navigate("/", {
        state: { // 만약 signUp을 통해 처음 들어온 User라면, Home 화면에서 Welcome 안내문이나 사용 방법 튜토리얼등을 렌더하기 위함.
          nickname: response.nickname, // useLocation을 통해 해당 props를 받을 수 있음.
        }
      });

    })(/* IIFE */);
  }

  // Validator instance with useMemo. V-dom update랑 관계없이 항상 보유.
  const _validator = useMemo(() => { 
    console.log("setting validator...");
    return new Utils.Validator();
  }, []) // calculate only on first render.

  // nickname이 바뀔 때 마다 검증 시도 --> 통과시 submit 버튼 활성화
  useEffect(() => {
    if (_validator.isAcceptable("@Nickname", nickname) /* && imageFile*/) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [nickname])

  return (
    <div className=" w-screen h-screen flex justify-center items-center">
      <div
        className=" border border-green-400
                    p-5
                    max-w-sm bg-white rounded-lg shadow-lg 
                    flex flex-col"
      >
        {/* Profile Setting */}
        {/* TODO: 기본 제공 이미지 선택창이 있는게 좋지 않을까? */}
        <ImageUpload thumbnail={imageFile} setThumbnail={setImageFile} width={WIDTH} height={HEIGHT} />

        {/* Set Nickname */}
        <TextFieldWrapper
          value={nickname}
          onChange={setNickname}
          type={"text"}
          label={"nickname"}
          disabled={submitDisabled}
          disabledHelperText={"[DEV] 닉네임 조건을 여기에 입력할 예정입니다."}
        />

        {/* Submit Button */}
        <LoadingButton loading={isLoading} disabled={submitDisabled} sx={{marginTop: 2}} variant="outlined" onClick={handleSubmit}>
          Sign Up
        </LoadingButton>
      </div>
    </div>
  );
}