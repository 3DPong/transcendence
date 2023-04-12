
/**
 * 세션을 바탕으로 나에 대한 정보를 요청할 수 있는 API 입니다.
 * */

import {API_URL} from "../../../config/backend";
import {handleErrorFunction, useError} from "@/context/ErrorContext";
import {useNavigate} from "react-router";

interface GET_responseFormat {
  user_id: number;
  nickname: string;
  profile_url: string;
  two_factor: boolean;
}

// 최님에게 environment 받아와서 그 상태로 백엔드 폴더 들어가서 docker-compose-up -d 하면 바로 됨.
// backend-development 꺼 끌고 오면 된다!
// 지금 작업 하고 있는 브랜치에서 하겠습니다.
// 일단

// export async function getMySettings(handleError: handleErrorFunction) {
  export function getMySettings(handleError: handleErrorFunction) {

  /*
  const requestUri = `${API_URL}/api/user/me/settings`;

  const settingResponse = await fetch(requestUri, { method: "GET" });
  console.log("GET", requestUri);
  console.dir(settingResponse);

  if (!settingResponse.ok) {
    console.log("Response", settingResponse.status);
    const errorData = await settingResponse.json();
    handleError(
        "Get User Settings",
        errorData.message,
        settingResponse.status === 401 ? "/signin" : null,
    ); // redirect to /login page
    return ;
  }
  // on success
  const loadedSettings: GET_responseFormat = await settingResponse.json();
  return (loadedSettings);
   */

  let i = 0;
  return (function () {
    i++;
    const mock: GET_responseFormat = {
      user_id: Date.now() % 3 === 0 ? 1 : 2,
      nickname: "Jane",
      profile_url: "https://media.istockphoto.com/id/1317804578/photo/one-businesswoman-headshot-smiling-at-the-camera.jpg?s=612x612&w=0&k=20&c=EqR2Lffp4tkIYzpqYh8aYIPRr-gmZliRHRxcQC5yylY=",
      two_factor: false,
    }
    // console.log("user_id", mock.user_id);
    return mock;
  })();
}