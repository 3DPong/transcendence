/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   userRelation.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/22 19:25:57 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/27 22:04:39 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * User relations API 
 * @link https://github.com/3DPong/transcendence/issues/43
 */

import { Assert } from "@/utils/Assert";
import { globalUserData_t } from "@/types/user";
import { UserFriendRelationsDummyData, createUsersDummyByString } from "@/dummy/data";
import { TryRounded } from "@mui/icons-material";
import { fetchAndHandleSessionError } from "@/api/status/session";
import { useNavigate } from "react-router";

/*----------------------------------*
 *             GET API              *
 *----------------------------------*/

// GET /user/search/{string}

export interface GET_GlobalSearchResponseFormat {
  relations: globalUserData_t[];
}




export async function getUsersListBySearchString(searchString: string) {
  return new Promise<GET_GlobalSearchResponseFormat>(async (resolve, reject) => {

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
      const randomTestUsers = createUsersDummyByString(searchString, 50);
      console.dir(randomTestUsers);
      resolve({ relations: randomTestUsers });
    }, 50);
  });


};


/*----------------------------------*
 *             GET API              *
 *----------------------------------*/
// GET /user_relation
// GET /user_relation?relation=friend
// GET /user_relation?relation=block

export enum GET_RelationType {
  none,
  friend,
  block,
}

export interface Relation {
  target_id: number;
  nickname: string;
  profile_url: string;
  status: 'friend' | 'block' | 'none';
}

export interface GET_RelationResponseFormat {
  relations: Relation[]; // Array
}

// GET /user_relation
// GET /user_relation?relation=friend
export const getUserRelationsList = (type: GET_RelationType) => {
 return new Promise<GET_RelationResponseFormat>((resolve, reject) => {
    let GET_URL;
    switch(type) {
      case GET_RelationType.none: // 전체 사용자 그룹.
        GET_URL = `/user_relation`;
        break;
      case GET_RelationType.friend:
        GET_URL = `/user_relation?relation=friend`;
        break;
      case GET_RelationType.block:
        GET_URL = `/user_relation?relation=block`;
        break;
    }

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

    // API MOCKUP (추후 바꿔야 함.)
    setTimeout(() => {
      resolve(UserFriendRelationsDummyData);
    }, 50);
  });
}

/*----------------------------------*
 *             PUT API              *
 *----------------------------------*/

// PUT /user_relation
export interface PUT_RelationRequestFormat {
  target_id: number;
  status: 'friend' | 'block' | 'none';
};
export interface PUT_RelationResponseFormat {
  target_id: number;
  status: 'friend' | 'block' | 'none'; // 대소문자 주의
};

export enum PUT_RelationActionType {
  addFriend,
  blockUser, // same as delete friend
  unBlockUser,
}

// PUT /user_relation
export const changeUserRelation = (targetId: number, action: PUT_RelationActionType) => {
  return new Promise<PUT_RelationResponseFormat>((resolve, reject) => {

    const PUT_URL = "/user_relation";

    let request: PUT_RelationRequestFormat = { target_id: targetId, status: 'none'};
    switch (action) {
      case PUT_RelationActionType.addFriend:
        request.status = "friend";
        break;
      case PUT_RelationActionType.blockUser:
        request.status = "block";
        break;
      case PUT_RelationActionType.unBlockUser:
        request.status = "none";
        break;
      default:
        Assert.MustBeTrue(false, "No matching relation action");
    }

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

    // API MOCKUP (추후 바꿔야 함.)
    setTimeout(() => {
      const response: PUT_RelationResponseFormat = {
        target_id : request.target_id,
        status : (request.status ? request.status : "none") 
      }; // 정상 수행일 경우 res = req
      resolve(response);
    }, 50);
  });
};
