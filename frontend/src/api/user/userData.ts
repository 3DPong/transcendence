/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   userData.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/22 20:06:17 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/31 17:21:09 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { uploadImageToServer } from "@/api/upload/upload";
import {useError} from "@/context/ErrorContext";
import {API_URL} from "../../../config/backend";
import {useNavigate} from "react-router";

// 모든 사용자에 대해 데이터를 요청할 수 있는 API 입니다.

/*----------------------------------*
 *             GET API              *
 *----------------------------------*/
// 사용자 상세 데이터
// GET /user/{userId} --> 내가 아는 상대방의 데이터 검색.
// GET /user/search/[검색문자열] --> 전체 사용자 리스트 검색.


export interface GET_UserDataResponseFormat {
    user_id     : number;
    nickname    : string;
    profile_url : string;
    wins        : number;
    losses      : number;
    total       : number;
    level       : number;
}

// 친구가 추가되면


export async function getUserDataById(userId: number) {
  const {handleError} = useError();

  const requestUrl = `${API_URL}/api/user/${userId}`;
  const userDataResponse = await fetch(requestUrl, { method: "GET" });

  // on error
  if (!userDataResponse.ok) {
    const errorData = await userDataResponse.json();
    handleError(
        "UserData",
        errorData.message,
        () => {
          if (userDataResponse.status === 401) { // if status code is 401, then session is invalid. login again.
            console.log("[401 Error] redirecting to login page...")
            const navigate = useNavigate();
            navigate("/login");
          }
        }); // redirect to /login page
    return ;
  }
  // on success
  const userData: GET_UserDataResponseFormat = await userDataResponse.json();
  return (userData);
};


/*----------------------------------*
 *             회원 정보 수정              *
 *----------------------------------*/

export interface PUT_UserDataRequestFormat {
  nickname?     : string;
  profile_url?  : string;
}

export interface PUT_UserDataResponseFormat {
  user_id: number;
  nickname: string;
  profile_url: string;
  wins: number;
  losses: number;
  total: number;
  level: number;
}

// POST, 내 정보 수정하기
export async function updateUserData(
  nickname?: string,
  clientSideImageUrl?: string,
) {
  const {handleError} = useError();

  // 1. 서버에 프로필 이미지부터 전송.
  let serverSideImageUrl: string | undefined;
  if (clientSideImageUrl) {
    serverSideImageUrl = await uploadImageToServer(clientSideImageUrl);
  }

  // 2. 정보 수정 Request 생성.
  const request: PUT_UserDataRequestFormat = {};
  if (nickname) { request.nickname = nickname; }
  if (serverSideImageUrl) { request.profile_url = serverSideImageUrl; }

  // 3. 서버에 Request 전송
  const requestUrl = `${API_URL}/api/user/`;
  const updateResponse = await fetch(requestUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request)
  });

  // on error
  if (!updateResponse.ok) {
    const errorData = await updateResponse.json();
    handleError(
        "UserData",
        errorData.message,
        () => {
          if (updateResponse.status === 401) { // if status code is 401, then session is invalid. login again.
            console.log("[401 Error] redirecting to login page...")
            const navigate = useNavigate();
            navigate("/login");
          }
        }); // redirect to /login page
    return ;
  }
  // on success
  const userData: PUT_UserDataResponseFormat = await updateResponse.json();
  console.log("userData me update result:", userData);
  return (userData);
}
