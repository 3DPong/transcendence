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
import { useAlert } from '@/context/AlertContext';
import { API_URL } from '../../../../config/backend';

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
  const defaultImageUrl = `${API_URL}/image`;
  const { setLoggedUserId } = useContext(GlobalContext);
  const [imageFile, setImageFile] = useState<string>(defaultImageUrl);
  const [nickname, setNickname] = useState<string>('');
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleAlert } = useAlert();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (submitDisabled) return;
    if (!imageFile) {
      handleAlert('SignUp', '회원가입시 프로필 이미지는 반드시 설정되어야 합니다.', null, 'warning');
      return;
    }

    (async () => {
      console.log('handle submit');
      setIsLoading(true);
      const res = await API.requestSignUp(handleAlert, nickname, imageFile);
      setIsLoading(false);
      if (res) {
        handleAlert('SignUp', '회원 가입이 완료되었습니다. 재로그인 해주시기 바랍니다.', '/signin', 'success');
      }
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

  const WIDTH = 250;
  const HEIGHT = 250;

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
