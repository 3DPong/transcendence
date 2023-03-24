/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Profile.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/14 19:38:02 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/24 19:31:21 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useContext, useEffect, useState, useMemo } from "react";
import ProfileCard from "./ProfileCard";
import ProfileStatistic from "./ProfileStatistic";
import { useLocation, useParams } from "react-router";
import * as API from "@/api/API";
import GlobalContext from "@/context/GlobalContext";
import { Assert } from "@/utils/Assert";

export default function Profile() {
  const [ profileState, setProfileState ] = useState<API.GET_UserDataResponseFormat>();
  const { loggedUserId } = useContext(GlobalContext);
  const { pathname } = useLocation();

  // 만약 /profile 경로일 경우 userIdFromRouteURL은 undefined 이다.
  
  // (1) initial data loading
  useEffect(() => {
    (async () => {

      Assert.NonNullish(loggedUserId, "UserId is null")

      // (1) parse :user_id to get user_id
      let user_id: number;
      const lastIdx = pathname.lastIndexOf("/");
      const subUrl = pathname.slice(lastIdx + 1);
      const convertResult = parseInt(subUrl);
      console.log(`URL parse result: url param (userId) is ${convertResult}`);
      if (isNaN(convertResult)) {
        user_id = loggedUserId;
      } else {
        user_id = convertResult;
      }
      // (2) load data
      const profile = await API.getUserDataById(user_id);
      setProfileState(profile);
    })(/* IIFE */);
  }, [pathname]); // call useEffect if pathname changes

  return (
    <div>
      <ProfileCard userData={profileState} />
      <ProfileStatistic userData={profileState} />
    </div>
  );
}
