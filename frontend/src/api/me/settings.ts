/**
 * 세션을 바탕으로 나에 대한 정보를 요청할 수 있는 API 입니다.
 * */

import { handleErrorFunction } from '@/context/ErrorContext';
import {API_URL} from "../../../config/backend";

interface GET_responseFormat {
  user_id: number;
  nickname: string;
  profile_url: string;
  two_factor: boolean;
}

export async function getMySettings(handleError: handleErrorFunction, navigateFunction: (url:string)=>void ) {
  const requestUri = `${API_URL}/user/me/settings`;

  const settingResponse = await fetch(requestUri, { method: "GET" });
  console.log("GET", requestUri);
  console.dir(settingResponse);

  if (!settingResponse.ok) {
    console.log("Response", settingResponse.status);
    const errorData = await settingResponse.json();
    if (settingResponse.status === 401) {
      console.log("[DEV] redirect to signIn...");
      navigateFunction("/signin"); // 401일 경우 세션에러임으로 로그인 페이지로 이동.
      return ;
    } else {
      handleError(
          "Get User Settings", // 그게 아니라면 그냥 API 에러알림 띄워주기
          errorData.message,
      );
    }
    return ;
  }
  // on success
  const loadedSettings: GET_responseFormat = await settingResponse.json();
  return (loadedSettings);

  /*
  const mock: GET_responseFormat = {
    user_id: 999999,
    nickname: 'Jane',
    profile_url:
        'https://media.istockphoto.com/id/1317804578/photo/one-businesswoman-headshot-smiling-at-the-camera.jpg?s=612x612&w=0&k=20&c=EqR2Lffp4tkIYzpqYh8aYIPRr-gmZliRHRxcQC5yylY=',
    two_factor: false,
  };
  return mock;
  */
}
