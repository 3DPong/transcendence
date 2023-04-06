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

import React, { useEffect, useState } from "react";
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
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);

  // API GET global user list
  // 굳이 돋보기 버튼이 필요한가 라는 의문에 일단 아래처럼 입력할때 요청되도록 했음.
  // TODO: 나중에 onClick 꼭 지울 것!
  const onClick = () => {
    if (submitDisabled) return;
    console.log("API GET global list");

    (async () => {
      setIsLoading(true);
      const userList = await API.getUserListBySearchString(searchString);
      if (userList) {
        setGlobalUsers(userList);
      }
      setIsLoading(false);
    })(/* IIFE */);
  };

  const onKeyUp = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if (event.key === "Enter") {
      onClick();
    }
  };

  useEffect(() => {
    if (searchString.length < 3) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  }, [searchString]);

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
      <div className=" border m-0 p-4 pb-6">
        <SearchTextField
          state={searchString}
          setState={setSearchString}
          onClick={onClick}
          onKeyUp={onKeyUp}
          label={"친구를 찾아보세요"}
          disabled={submitDisabled}
          disabledHelperText={"3글자 이상 입력하세요"}
        />
      </div>

      {/*  */}
      <VirtualizedUserList globalUsers={globalUsers} setGlobalUsers={setGlobalUsers} isLoading={isLoading} />
    </>
  );
}
