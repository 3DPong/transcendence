/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LocalUserList.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/11 14:37:57 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 20:34:13 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


/** (1) List component  
 * @link1 https://mui.com/material-ui/react-list/
 * 
 * @link2 https://mui.com/material-ui/react-app-bar/
 * 
 * @link3 https://mui.com/material-ui/react-skeleton/ --> 로딩 지연시 보여줄 내용. (Skeleton)
 * 
 *      - Header
 *      - AddBtn
 *      - Search
 *      - SearchResult (Below is an example if UserList)
 *          - UserCard
 *              - Profile image
 *              - Nickname
 *              - actionBtn (Ban, Add, sendDM)
 * 
*/ 


import React, {useEffect, useState} from "react";
import SearchTextField from "@/components/Molecule/SearchTextField";
import VirtualizedUserList from "./UserList";
import MediaCard from "@/components/Molecule/MediaCard";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { ItemButtonLink } from "@/components/Organism/Controller/Controller";

export interface User {
    imgSrc: string, // img url
    name:   string, // nickname
}

export type Users = User[]; // user배열.

// Test code
const UserDataTest: Users = [
    {
        imgSrc : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        name   : "minkyeki",
    },
    {
        imgSrc : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        name   : "minkyeuKim",
    },
    {
        imgSrc : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        name   : "Jake",
    },
    {
        imgSrc : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        name   : "DongKim",
    },
    {
        imgSrc : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        name   : "User5",
    },
    {
        imgSrc : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        name   : "User6",
    },
    {
        imgSrc : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        name   : "User7",
    },
]
    
const createInitialUsers = (initialCount: number) => {
    let users = new Array<User>();
    while (initialCount > 0) {
        users.push({
            imgSrc : "",
            name: initialCount.toString(),
        })
        --initialCount;
    }
    return users;
}


export default function LocalUserList() {

    // (0) UserData (Skeleton render를 위한 초기 initial render용 데이터.)
    const [users, setUsers] = useState<Users>( createInitialUsers(7) );
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // (1) 검색할 문자열.
    const [searchString, setSearchString] = useState<string>("");
    
    const getUserData = () => {
        setIsLoading(true); // 로딩중 flag
        return new Promise<Users>((resolve, reject) => {
            setTimeout(() => {
                resolve(UserDataTest);
            }, 2000);
        });
    }

    // (1) initial data loading
    useEffect(() => {
        // async load
        (async () => {
            const receivedData = await getUserData();
            setUsers(receivedData);
            setIsLoading(false);
        })(/* IIFE */);
    }, []);

    return (
        <>
            {/*  */}
            <MediaCard
                // 이미지는 Dribble에서 가져옴. https://dribbble.com/shots/17023457-Friend
                imageUrl="https://cdn.dribbble.com/users/1217289/screenshots/16269024/media/15c298956c3cb72d8480344cb71028d0.png?compress=1&resize=800x600&vertical=top"
                title="My Friends"
                body="body2 text"
            />

            {/* https://mui.com/material-ui/icons/ */}
            <div className=" absolute top-0 right-0">
                <ItemButtonLink primary="Add Friend" to="/friends/add" icon={ <AddBoxIcon fontSize="large" sx={{color: "#ffffff"}}/>}/>
            </div>


            {/*  */}
            <div className=" border m-0 p-0">
                <SearchTextField state={searchString} setState={setSearchString} />
            </div>

            {/*  */}
            <VirtualizedUserList users={users} isLoading={isLoading} searchString={searchString} />
        </>
    );
}