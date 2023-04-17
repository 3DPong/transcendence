import { uploadImageToServer } from '@/api/upload/upload';
import { API_URL } from '../../../config/backend';
import { handleErrorFunction, useError } from '@/context/ErrorContext';
import GlobalContext from '@/context/GlobalContext';
import { useContext } from 'react';

export interface POST_SignUpRequestFormat {
  nickname: string;
  profile_url: string;
}

export interface POST_SignUpResponseFormat {
  user_id: number;
}

type user_id = number;

/*******************
 *    회원 가입
 *******************/
export async function requestSignUp(
  handleError: handleErrorFunction,
  nickname: string,
  clientSideImageUrl: string
) {
  // 0. 닉네임 중복 검사.
  const isNicknameOk = await verifyNickname(handleError, nickname);
  if (!isNicknameOk) return; // 여기서 에러나면 걍 끝

  // 1. 서버에 프로필 이미지부터 전송.
  const serverSideImageUrl = await uploadImageToServer(handleError, clientSideImageUrl);
  if (!serverSideImageUrl) return; // 여기서 에러나면 걍 끝

  // 2. 서버의 이미지 src를 받은 후 그걸로 회원가입 처리 진행.
  const requestUrl = `${API_URL}/user`;
  const requestPayload: POST_SignUpRequestFormat = {
    nickname: nickname,
    profile_url: serverSideImageUrl,
  };

  const signUpResponse = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  // on error
  if (!signUpResponse.ok) {
    if (signUpResponse.status === 401) {
      const errorData = await signUpResponse.json();
      handleError('Sign Up', errorData.message, 'signin');
      return;
    } else {
      const errorData = await signUpResponse.json();
      handleError('Sign Up', errorData.message);
      return;
    }
  }
  // on success
  const responseData: POST_SignUpResponseFormat = await signUpResponse.json();
  return responseData.user_id;
}

/*******************
 *    닉네임 중복 검사
 *******************/
interface verifyResponse {
  isDuplicate: boolean;
}
export async function verifyNickname(handleError: handleErrorFunction, name: string) {
  const requestUrl = `${API_URL}/user/verify/nickname/:${name}`;
  const response = await fetch(requestUrl, {
    method: 'POST'
  })
  if (!response.ok) {
    if (response.status === 401) {
      const errorData = await response.json();
      handleError('Verify Nickname', errorData.message, "/signin");
      return ; // null on error
    } else {
      const errorData = await response.json();
      handleError('Verify Nickname', errorData.message);
      return ; // null on error
    }
  }
  const responsePayload: verifyResponse = await response.json();
  return (responsePayload.isDuplicate);
}