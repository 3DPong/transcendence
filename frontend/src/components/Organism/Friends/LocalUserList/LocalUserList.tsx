/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LocalUserList.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/11 14:37:57 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 16:28:20 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState } from "react";
import SearchTextField from "@/components/Molecule/SearchTextField";
import VirtualizedUserList from "@/components/Organism/Friends/LocalUserList/List";
import MediaCard from "@/components/Molecule/MediaCard";
import ButtonLink from "@/components/Molecule/Link/ButtonLink";
import AddBoxIcon from '@mui/icons-material/AddBox';


export default function LocalUserList() { 

    const [ searchString, setSearchString ] = useState<string>(""); // 검색 문자열.

    return (
        <>
            {/*  */}
            <MediaCard
                // 이미지는 Dribble에서 가져옴. https://dribbble.com/shots/17023457-Friend
                imageUrl="https://cdn.dribbble.com/users/1217289/screenshots/16269024/media/15c298956c3cb72d8480344cb71028d0.png?compress=1&resize=800x600&vertical=top"
                title="My Friends"
                body="body2 text"
            />

            <div className=" absolute top-32 right-4">
                <ButtonLink primary="Add Friend" to="./add" sx={{color: "#ffffffff"}} >
                    <AddBoxIcon fontSize="large" />
                </ButtonLink>
            </div> 

            {/*  */}
            <div className=" border m-0 p-4">
                <SearchTextField state={searchString} setState={setSearchString} placeholder={"친구 찾기"}/>
            </div>

            {/*  */}
            <VirtualizedUserList searchString={searchString} />
        </>
    );
}