import { uploadImageToServer, verifyNickname } from '@/api/upload/upload';
import {API_URL, ORIGIN_URL} from '../../../config/backend';
import { handleAlertFunction } from '@/context/AlertContext';

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
  handleAlert: handleAlertFunction,
  nickname: string,
  clientSideImageUrl: string
) {
  // 0. 닉네임 중복 검사.
  const isNicknameOk = await verifyNickname(handleAlert, nickname);
  if (!isNicknameOk) {
    handleAlert("Invalid Nickname", "이미 존재하는 닉네임입니다.");
    return ;
  }

  // 1. 서버에 프로필 이미지부터 전송.
  const serverSideImageUrl = await uploadImageToServer(handleAlert, clientSideImageUrl);
  if (!serverSideImageUrl) {
    handleAlert("Image Upload", "서버에 이미지를 업로드하지 못했습니다.");
    return ;
  }

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
      handleAlert('Sign Up', errorData.message, 'signin');
      return;
    } else {
      const errorData = await signUpResponse.json();
      handleAlert('Sign Up', errorData.message);
      return;
    }
  }
  return signUpResponse;
}