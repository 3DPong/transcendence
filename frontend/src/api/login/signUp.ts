

import { uploadImageToServer } from "@/api/upload/upload";
import { API_URL } from "../../../config/backend";
import {useError} from "@/context/ErrorContext";
import GlobalContext from "@/context/GlobalContext";
import {useContext} from "react";

export interface POST_SignUpRequestFormat {
  nickname: string,
  profile_url: string,
}

export interface POST_SignUpResponseFormat {
  user_id: number;
}

type user_id = number;
// SUCCESS = 201 Created
export async function requestSignUp(_nickname: string, clientSideImageUrl: string)
    : Promise<user_id | void>
{
  const {handleError} = useError();

  // 1. 서버에 프로필 이미지부터 전송.
  const serverSideImageUrl = await uploadImageToServer(clientSideImageUrl);

  // 2. 서버의 이미지 src를 받은 후 그걸로 회원가입 처리 진행.
  const requestUrl = `${API_URL}/api/user`;
  const requestPayload: POST_SignUpRequestFormat = {
    nickname: _nickname,
    profile_url: serverSideImageUrl,
  }

  const signUpResponse = await fetch(requestUrl, {
    method: "POST",
    headers:{
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  // on error
  if (!signUpResponse.ok) {
    const errorData = await signUpResponse.json();
    handleError("Sign Up", errorData.message);
    return ;
  }

  // on success
  const {setLoggedUserId} = useContext(GlobalContext);
  const responseData: POST_SignUpResponseFormat = await signUpResponse.json();
  return (responseData.user_id);
};
