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

// 친구 사용자 정보
export interface friendData_t {
  user_id: number;
  profile_url: string;
  nickname: string;
}

// 일반 사용자 정보 (친구 포함. 여기엔 relation이 필요함)
export interface globalUserData_t extends friendData_t {
  status: 'friend' | 'block' | 'none';
}
