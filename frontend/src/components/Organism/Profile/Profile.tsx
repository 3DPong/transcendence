/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Profile.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/14 19:38:02 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/31 18:10:42 by minkyeki         ###   ########.fr       */
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
  const [profileState, setProfileState] = useState<API.GET_UserDataResponseFormat>();
  const { pathname } = useLocation();
  const { loggedUserId } = useContext(GlobalContext);

  // (1) initial data loading
  useEffect(() => {
    (async () => {
      // (1) parse :user_id to get user_id
      let user_id: number;
      const lastIdx = pathname.lastIndexOf("/");
      const subUrl = pathname.slice(lastIdx + 1);
      const convertResult = parseInt(subUrl);
      console.log(`URL parse result: url param (userId) is ${convertResult}`);
      if (isNaN(convertResult)) {
        // user_id = loggedUserId;
      } else {
        user_id = convertResult;
      }
      // (2) load data
      Assert.NonNullish(loggedUserId);
      const mySettings = await API.getUserDataById(loggedUserId);
      if (mySettings) {
        setProfileState(mySettings);
      }
    })(/* IIFE */);
  }, [pathname]); // call useEffect if pathname changes

  return (
    <div>
      <ProfileCard userData={profileState} />
      <ProfileStatistic userData={profileState} />
    </div>
  );
}
