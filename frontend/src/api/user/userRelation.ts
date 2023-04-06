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
 */

import { Assert } from "@/utils/Assert";
import { globalUserData_t } from "@/types/user";
import { useNavigate } from "react-router";
import {API_URL} from "../../../config/backend";
import {handleErrorFunction, useError} from "@/context/ErrorContext";

/*----------------------------------------*
 *    GET user_relations API              *
 *----------------------------------------*/

export interface GET_GlobalSearchResponseFormat {
  relations: globalUserData_t[];
}

const validateSessionStatus = async (handleError: handleErrorFunction, res: Response) => {
  if (!res.ok) {
    const errorData = await res.json();
    handleError(
        "UserData",
        errorData.message,
        "/login",
        ); // redirect to /login page
    return;
  }
  return (res);
}

export async function getUserListBySearchString(handleError: handleErrorFunction, searchString: string) {

  const requestUrl = `${API_URL}/api/user/search/${searchString}`;
  const userListResponse = await fetch(requestUrl, { method: "GET" });

  // on error
  const validatedResponse = await validateSessionStatus(handleError, userListResponse);
  if (!validatedResponse) {
    return;
  }
  // on success
  const userData: GET_GlobalSearchResponseFormat = await validatedResponse.json();
  return (userData.relations);
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

export async function getUserListByRelationType(handleError: handleErrorFunction, type: GET_RelationType) {
  let requestUrl;
  switch(type) {
    case GET_RelationType.none: // 전체 사용자 그룹.
      requestUrl = `${API_URL}/api/user_relation`;
      break;
    case GET_RelationType.friend:
      requestUrl = `${API_URL}/api/user_relation?relation=friend`;
      break;
    case GET_RelationType.block:
      requestUrl = `${API_URL}/api/user_relation?relation=block`;
      break;
  }
  const userListResponse = await fetch(requestUrl, { method: "GET" });
  // on error
  const validatedResponse = await validateSessionStatus(handleError, userListResponse);
  if (!validatedResponse) {
    return;
  }
  // on success
  const userData: GET_RelationResponseFormat = await validatedResponse.json();
  return (userData.relations);
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
export async function changeUserRelation(handleError: handleErrorFunction, targetId: number, action: PUT_RelationActionType) {

  const requestUrl = `${API_URL}/api/user_relation`;

  let requestPayload: PUT_RelationRequestFormat = { target_id: targetId, status: 'none'};
  switch (action) {
    case PUT_RelationActionType.addFriend:
      requestPayload.status = "friend";
      break;
    case PUT_RelationActionType.blockUser:
      requestPayload.status = "block";
      break;
    case PUT_RelationActionType.unBlockUser:
      requestPayload.status = "none";
      break;
    default:
      Assert.MustBeTrue(false, "No matching relation action");
  }

  const userListResponse = await fetch(requestUrl, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });
  // on error
  const validatedResponse = await validateSessionStatus(handleError, userListResponse);
  if (!validatedResponse) {
    return;
  }
  // on success
  const userData: PUT_RelationResponseFormat = await validatedResponse.json();
  return (userData);
};
