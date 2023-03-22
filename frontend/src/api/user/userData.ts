/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   userData.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/22 20:06:17 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/22 20:06:17 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import GlobalContext from "@/context/GlobalContext";
import { useContext } from "react";



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

// Create Dummy Data
const createUserDummyDataById = (userId: number) => {
  const DUMMY_IMG = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png";
    return {
      user_id     : userId,
      nickname    : "User" + userId.toString(),
      profile_url : DUMMY_IMG,
      wins        : 0, // no use
      losses      : 0, // no use
      total       : 0, // no use
      level       : 0, // no use
    }
};

// 단일 사용자 데이터 요청
export const getUserDataById = (userId: number) => {
  return new Promise<GET_UserDataResponseFormat>((resolve, reject) => {

    const GET_URL = `/user/${userId}`;

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
export const updateUserData = (
  nickname?: string,
  profile_url?: string,
  twofactor?: boolean,
) => {
  return new Promise<POST_UserDataResponseFormat>((response, resolve) => {
    
    const {loggedUserId} = useContext(GlobalContext);
    const POST_URL = "/user";

    setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      const resultMockUp = createUserDummyDataById(loggedUserId);
      nickname && (resultMockUp.nickname = nickname);
      profile_url && (resultMockUp.profile_url = profile_url);
      // resultMockUp.twofactor = twofactor;
      resolve(resultMockUp);
    }, 50);


  })

}