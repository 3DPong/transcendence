/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UserListRow.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/11 16:30:55 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/21 03:31:16 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * @link https://mui.com/material-ui/react-menu/
 */

// 이 컴포넌트는 User LIst Row 한칸에 표기할 정보들입니다. (flex.) (리스트에서 User 1명)

import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import { friendData_t } from '@/types/user';
import Chip from '@mui/material/Chip';

export interface UserCardProps {
  user: friendData_t;
  isLoading: boolean; // for skeleton
}

export default function UserListRow(props: UserCardProps) {
  return (
    // 부모 flex container에 꽉 채우기 위한 용도 div
    <div className="flex-1">
      <div className=" w-auto flex items-center">
        {/* (1) 프로필 사진 */}
        {props.isLoading ? (
          <Skeleton animation="wave" variant="rectangular">
            <Avatar variant="square" />
          </Skeleton>
        ) : (
          <Avatar variant="square" alt={props.user.nickname} src={props.user.profile_url} />
        )}
        {/* (2) 프로필 이름 */}
        <div className="flex-1 ml-4 mr-2">
          <Typography variant="subtitle1" component="div">
            {props.isLoading ? <Skeleton /> : props.user.nickname}
          </Typography>
        </div>
      </div>
    </div>
  );
}
