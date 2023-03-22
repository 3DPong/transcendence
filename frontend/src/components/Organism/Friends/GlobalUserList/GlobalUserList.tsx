/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GlobalUserList.tsx                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/11 14:37:57 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/20 17:31:25 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, { useState } from "react";
import SearchTextField from "@/components/Molecule/SearchTextField";
import VirtualizedUserList from "@/components/Organism/Friends/GlobalUserList/List";
import MediaCard from "@/components/Molecule/MediaCard";
import { friendData_t, globalUserData_t } from "@/types/user";
import useArray from "@/utils/CustomHooks/useArray";
import * as API from "@/api/API";

export default function GlobalUserList() {

  const [globalUsers, setGlobalUsers] = useArray<globalUserData_t>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>(""); // 검색할 문자열.

  // API GET global user list
  const onClick = () => {
    console.log("API GET global list");

    // (1) allow
    if (searchString.length < 3) {
      alert("enter more than 3 characters");
      return;
    }


    (async () => {
      setIsLoading(true);
      const receivedData = await API.getUsersListBySearchString(searchString);
      setGlobalUsers(receivedData.relations);
      setIsLoading(false);
    })(/* IIFE */);
  };

  const onKeyUp = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if (event.key === "Enter") {
      onClick();
    }
  };

  return (
    <>
      {/*  */}
      <MediaCard
        // 이미지는 Dribble에서 가져옴. https://dribbble.com/shots/17023457-Friend
        imageUrl="https://cdn.dribbble.com/userupload/3345426/file/original-810456efca16997843a7cf36f34b4ef7.png?compress=1&resize=1024x684"
        title="Add Friends"
        body="body2 text"
      />

      {/* https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp */}
      <div className=" border m-0 p-4">
        <SearchTextField
          state={searchString}
          setState={setSearchString}
          onClick={onClick}
          onKeyUp={onKeyUp}
          placeholder={"친구 찾기"}
        />
      </div>

      {/*  */}
      <VirtualizedUserList
        globalUsers={globalUsers}
        setGlobalUsers={setGlobalUsers}
        isLoading={isLoading}
      />
    </>
  );
}