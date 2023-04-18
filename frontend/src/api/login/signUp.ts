import { uploadImageToServer, verifyNickname } from '@/api/upload/upload';
import {API_URL, ORIGIN_URL} from '../../../config/backend';
import { handleErrorFunction } from '@/context/ErrorContext';

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
  console.log("[DEV] verifyNickname Success");

  // 1. 서버에 프로필 이미지부터 전송.
  const serverSideImageUrl = await uploadImageToServer(handleError, clientSideImageUrl);
  if (!serverSideImageUrl) return; // 여기서 에러나면 걍 끝
  console.log("[DEV] uploadImage Success");

  // 2. 서버의 이미지 src를 받은 후 그걸로 회원가입 처리 진행.
  const requestUrl = `${API_URL}/user`;
  const requestPayload: POST_SignUpRequestFormat = {
    nickname: nickname,
    profile_url: `${ORIGIN_URL}${serverSideImageUrl}`,
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
  return signUpResponse;
}