/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ListItemButtonLink.tsx                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/15 02:36:32 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/15 22:30:03 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';

/************************************************
 * List의 각 요소를 Router로 연결해주는 컴포넌트.  *
 ************************************************/
/**
 * React Routing
 * - @link3 https://mui.com/material-ui/guides/routing/#list
 */

import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

import Tooltip from '@mui/material/Tooltip'; // 마우스 hover시에 힌트 뜨기 위함.
import Badge from '@mui/material/Badge';
import Skeleton from '@mui/material/Skeleton';
import { SxProps } from '@mui/material';
import { Theme } from '@emotion/react';

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(itemProps, ref) {
  return <RouterLink ref={ref} {...itemProps} role={undefined} />;
});

/** Provide a full description, for instance, with #aria-label.
 * @link1 https://mui.com/material-ui/react-badge/
 */
function notificationsLabel(count: number) {
  if (count === 0) {
    return 'no notifications';
  }
  if (count > 99) {
    return 'more than 99 notifications';
  }
  return `${count} notifications`;
}

interface ListItemLinkProps {
  tooltipTitle: string; // button의 내용. 표시되지는 않으나, Tooltip에 표시됨.
  to: string;
  badge?: number; // 새로운 이벤트 발생시, 그 알림 숫자를 표시.
  style?: React.CSSProperties;
  onClick?: () => void;
  children?: React.ReactNode;
  divider?: boolean;
  sx?: SxProps<Theme>;
  className?: string;
}

export default function ListItemButtonLink(props: ListItemLinkProps) {
  const { children, tooltipTitle, to, badge, style, onClick, divider, className, sx } = props;

  return (
    <li className=" list-none">
      <Tooltip title={tooltipTitle} placement="right-start">
        {/* 여기가 Anchor 태그. 마우스 올리면 hover되는 부분. */}
        <ListItemButton style={style} component={Link} to={to} divider={divider} className={className} sx={props.sx}>
          {children ? (
            <ListItemIcon
              onClick={onClick}
              aria-label={notificationsLabel(badge ? badge : 0)}
              sx={{ minWidth: 0, mr: 'auto', maxWidth: '100%', flex: 1 }}
            >
              <Badge
                badgeContent={props.badge}
                color="primary"
                max={99}
                sx={{ flex: 1, '& .MuiBadge-badge': { fontSize: 7, height: 15, minWidth: 15 } }}
              >
                {children}
              </Badge>
            </ListItemIcon>
          ) : null}

          {/* <ListItemText primary={primary} /> */}
        </ListItemButton>
      </Tooltip>
    </li>
  );
}
