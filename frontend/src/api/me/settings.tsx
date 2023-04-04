
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

export async function getMySettings(handleError: handleErrorFunction) {

  // const {handleError} = useError();
  // const navigate = useNavigate();
  const requestUri = `${API_URL}/api/user/me/settings`;
  const settingResponse = await fetch(requestUri, { method: "GET" });
  // return (settingResponse);
  // on error
  if (!settingResponse.ok) {
    const errorData = await settingResponse.json();
    handleError(
        "Sign Up",
        errorData.message,
        () => {
          if (settingResponse.status === 401) { // if status code is 401, then session is invalid. login again.
            console.log("[401 Error] redirecting to login page...")
            // navigate("/login");
            history.pushState({}, "", "/login");
          }
    }); // redirect to /login page
    return ;
  }
  // on success
  const loadedSettings: GET_responseFormat = await settingResponse.json();
  return (loadedSettings);
}