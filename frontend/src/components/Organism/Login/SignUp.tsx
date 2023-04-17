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

import { useState, useEffect, useContext, useMemo, useLayoutEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router';

import GlobalContext from '@/context/GlobalContext';
import ImageUpload from '@/components/Molecule/ImageUpload';
import * as Utils from '@/utils/Validator';
import * as API from '@/api/API';
import { useError } from '@/context/ErrorContext';

export interface TextFieldWrapperProps {
  value: string;
  onChange: (arg: string) => void;
  type?: string; // text or password... etc
  label?: string; // 이건 입력은 아니고, 단순 표시용 제목 (필드 제목)
  placeholder?: string; // 미입력시 기본으로 입력되는 내용 (초기값)
  disabled?: boolean; // Search 버튼 활성화 여부
  disabledHelperText?: string; // 오류시 표기할 내용.
}

export function TextFieldWrapper(props: TextFieldWrapperProps) {
  {
    /* https://mui.com/material-ui/react-text-field/ */
  }
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
      helperText={props.disabled ? props.disabledHelperText : ''} // 에러일 때만 표시
      required={true}
    />
  );
}

export function SignUp() {
  const { setLoggedUserId } = useContext(GlobalContext);
  const [imageFile, setImageFile] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleError } = useError();
  const navigate = useNavigate();

  const WIDTH = 250;
  const HEIGHT = 250;

  // check if user is already logged-in on first render
  // useLayoutEffect는 DOM paint가 이뤄지기 전에 호출됨으로 깜빡임을 해결 가능.
  useEffect(() => {
    // loggedUserId가 있고 세션스토리지도 있다는 얘기는 앱 로그인 후 사용자가 /signin 경로를 입력한 경우이다.
    // 이 경우는 암것도 하지 않고 home으로 리다이렉트만 시킨다.
    console.log(1);
    if (sessionStorage.getItem('user_id') !== null) {
      console.log(2);
      navigate('/'); // home 경로로 이동한다.
      return;
    }
  }, []);

  const handleSubmit = () => {
    if (submitDisabled) return;
    (async () => {
      console.log('handle submit');
      // 1. 서버에 가입 요청.
      setIsLoading(true);
      const user_id = await API.requestSignUp(handleError, nickname, imageFile);
      setIsLoading(false);
      if (user_id) {
        setLoggedUserId(user_id);
      }
      navigate('/');
    })(/* IIFE */);
  };

  // Validator instance with useMemo. V-dom update랑 관계없이 항상 보유.
  const _validator = useMemo(() => {
    console.log('setting validator...');
    return new Utils.Validator();
  }, []); // calculate only on first render.

  // nickname이 바뀔 때 마다 검증 시도 --> 통과시 submit 버튼 활성화
  useEffect(() => {
    if (_validator.isAcceptable('@Nickname', nickname) /* && imageFile*/) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [nickname]);

  // navigate 함수 사용시 컴포넌트 깜빡임 문제 해결을 위한 시도.
  if (sessionStorage.getItem('user_id') !== null) return <></>;
  else
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
            type={'text'}
            label={'nickname'}
            disabled={submitDisabled}
            disabledHelperText={_validator.getRuleHint('@Nickname')}
          />

          {/* Submit Button */}
          <LoadingButton
            loading={isLoading}
            disabled={submitDisabled}
            sx={{ marginTop: 2 }}
            variant="outlined"
            onClick={handleSubmit}
          >
            Sign Up
          </LoadingButton>
        </div>
      </div>
    );
}
