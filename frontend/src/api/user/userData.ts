/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   userData.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/22 20:06:17 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/24 19:12:35 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import GlobalContext from "@/context/GlobalContext";
import { Assert } from "@/utils/Assert";
import { useContext } from "react";
import { fetchAndHandleResponseError } from "@/api/error/error";
import { uploadImageToServer } from "@/api/upload/upload";


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

import MyDummyProfile from "@/dummy/dummy.png";
import { json } from "react-router";

// Create Dummy Data
const createUserDummyDataById = (userId: number) => {
    return {
      user_id     : userId,
      nickname    : "Dummy User" + userId.toString(),
      profile_url : MyDummyProfile,
      wins        : 0, // no use
      losses      : 0, // no use
      total       : 0, // no use
      level       : 0, // no use
    }
};

// 단일 사용자 데이터 요청
export async function getUserDataById(userId: number) {
  return new Promise<GET_UserDataResponseFormat>(async (resolve, reject) => {


    // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch
    /*
    const URL = `/user/search/${searchString}`;
    const response = await fetchAndHandleResponseError(URL, { method: "GET" });
    if (response) {
      const jsonObjcet = response.json();
      console.log("Response data JSON :"); console.dir(jsonObjcet);
      resolve (jsonObjcet);
    }
    */

    setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      const randomTestUser = createUserDummyDataById(userId);
      resolve(randomTestUser);
    }, 50);
  });
};


/*----------------------------------*
 *             POST API              *
 *----------------------------------*/
// 내 정보 수정 (나만 가능)
// POST /user

export interface POST_UserDataRequestFormat {
  nickname?     : string;
  profile_url?  : string;
  twofactor?    : boolean;
}

export interface POST_UserDataResponseFormat {
    user_id     : number;
    nickname    : string;
    profile_url : string;
    wins        : number;
    losses      : number;
    total       : number;
    level       : number;
}

// POST, 내 정보 수정하기
export async function updateUserData(
  user_id: number, // TODO: delete later!!
  nickname?: string,
  clientSideImageUrl?: string,
  twofactor?: boolean,
) {
  return new Promise<POST_UserDataResponseFormat>(async (resolve, reject) => {

    // 1. 서버에 프로필 이미지부터 전송.
    let serverSideImageUrl: string | undefined;
    if (clientSideImageUrl) {
      const response_1 = await uploadImageToServer(clientSideImageUrl);
      serverSideImageUrl = response_1.body; // 서버에 업로드된 이미지의 url
    }

    // 2. 정보 수정 Request 생성.
    const request: POST_UserDataRequestFormat = {};
    if (nickname) { request.nickname = nickname; }
    if (serverSideImageUrl) { request.profile_url = serverSideImageUrl; }
    if (twofactor) { request.twofactor = twofactor; }

    // 3. 서버에 Request 전송
    // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch
    /*
    const POST_URL = "/user";
    const response = await fetchAndHandleResponseError(POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request)
    });
    if (response) {
      const responseData: POST_UserDataResponseFormat = await response.json();
      console.log("Response data from JSON :");
      console.dir(responseData);
      resolve(responseData);
    }
    */

    setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      const resultMockUp = createUserDummyDataById(user_id);
      nickname && (resultMockUp.nickname = nickname);
      serverSideImageUrl && (resultMockUp.profile_url = serverSideImageUrl);
      // resultMockUp.twofactor = twofactor;
      resolve(resultMockUp);
    }, 1000);


  })

}
