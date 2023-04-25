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

import {uploadImageToServer, verifyNickname} from '@/api/upload/upload';
import { handleErrorFunction } from '@/context/ErrorContext';
import {API_URL, ORIGIN_URL} from '../../../config/backend';

// 모든 사용자에 대해 데이터를 요청할 수 있는 API 입니다.

/*----------------------------------*
 *             GET API              *
 *----------------------------------*/
// 사용자 상세 데이터
// GET /user/{userId} --> 내가 아는 상대방의 데이터 검색.
// GET /user/search/[검색문자열] --> 전체 사용자 리스트 검색.

export interface GET_UserDataResponseFormat {
  user_id: number;
  nickname: string;
  profile_url: string;
  wins: number;
  losses: number;
  total: number;
  level: number;
}

// 친구가 추가되면

export async function getUserDataById(handleError: handleErrorFunction, userId: number) {
  const requestUrl = `${API_URL}/user/${userId}`;
  const userDataResponse = await fetch(requestUrl, { method: "GET" });

  // on error
  if (!userDataResponse.ok) {
    const errorData = await userDataResponse.json();
    handleError(
        "UserData",
        errorData.message,
        errorData.status === 401 ? '/login' : null
    ); // redirect to /login page
    return ;
  }
  // on success
  const userData: GET_UserDataResponseFormat = await userDataResponse.json();
  return userData;
}

/*----------------------------------*
 *             회원 정보 수정              *
 *----------------------------------*/

export interface PUT_UserDataRequestFormat {
  nickname?: string;
  profile_url?: string;
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
export async function updateUserData(handleError: handleErrorFunction, nickname?: string, clientSideImageUrl?: string) {

  // 0. 닉네임 중복 검사.
  let nicknameToSubmit = "";
  let isNicknameOk;

  if (nickname) {
    isNicknameOk = await verifyNickname(handleError, nickname);
    if (isNicknameOk) {
      console.log("[DEV] verifyNickname Success");
      nicknameToSubmit = nickname;
    // } else { // 200, but has duplicated nickname
    //   handleError('Verify Nickname', "해당 Nickname은 이미 존재합니다.");
    }
  }

  // 1. 서버에 프로필 이미지부터 전송.
  // 1. 서버에 프로필 이미지부터 전송.
  let imageToSubmit: string | undefined;
  if (clientSideImageUrl) {
    const serverSideImageUrl = await uploadImageToServer(handleError, clientSideImageUrl);
    if (serverSideImageUrl) {
      console.log("[DEV] uploadImage Success");
      imageToSubmit = serverSideImageUrl;
    }
  }

  // 2. 정보 수정 Request 생성.
  const request: PUT_UserDataRequestFormat = {};
  if (nicknameToSubmit) {
    request.nickname = nicknameToSubmit;
  }
  if (imageToSubmit) {
    request.profile_url = `${ORIGIN_URL}${imageToSubmit}`;
  }

  // 3. 서버에 Request 전송
  const requestUrl = `${API_URL}/user/me`;
  console.log("request", requestUrl);
  const updateResponse = await fetch(requestUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  // on error
  if (!updateResponse.ok) {
    const errorData = await updateResponse.json();
    handleError('UserData', errorData.message, updateResponse.status === 401 ? '/signin' : null);
    return;
  } else if (!isNicknameOk) {
    handleError('Verify Nickname', "해당 Nickname은 이미 존재합니다.\n프로필 이미지만 업데이트되었습니다.");
  }
  // on success
  const userData: PUT_UserDataResponseFormat = await updateResponse.json();
  console.log('userData me update result:', userData);
  return userData;
}
