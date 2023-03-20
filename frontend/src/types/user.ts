/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/14 16:08:04 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 16:44:29 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export enum eUserStatus {
    offline,
    online,
}

export interface user_t {
    id          : number, // userId
    imgSrc      : string, // img url
    name        : string, // nickname
}

export interface userListData_t {
    profile     : user_t,
    isBlocked   : boolean, // true / false
    status      : eUserStatus, // online / offline
}

export type recentGames_t = Array<{ 
    opponent : user_t, // 상대편.
    isWin    : boolean, // 내가 이겼으면 true
}>

export interface userStatistic_t {
    totalGame   : number,
    totalWin    : number,
    totalLose   : number,
    recentGames : recentGames_t
}