/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ButtonLink.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/15 00:12:31 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/16 03:09:59 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from 'react';
import { Button } from '@mui/material';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip'; // 마우스 hover시에 힌트 뜨기 위함.
import { IconButton, SxProps } from '@mui/material';

/*************************************************************************************************
 * @NOTE 이 컴포넌트는 버튼 클릭시 지정된 Router 링크로 이동하도록 하는 기능을 구현한 컴포넌트 입니다.  *
 *************************************************************************************************/

/**
 * React Routing
 * @link https://mui.com/material-ui/guides/routing/
 */

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(itemProps, ref) {
  return <RouterLink ref={ref} {...itemProps} role={undefined} />;
});

interface ItemLinkProps {
  children: React.ReactNode;
  primary: string;
  to: string;
  onClick?: () => void;
  sx?: SxProps;
}

export default function ButtonLink(props: ItemLinkProps) {
  const { onClick, children, primary, to, sx } = props;
  return (
    <Tooltip title={primary} placement="bottom-start">
      <Button
        disableRipple
        onClick={onClick}
        component={Link}
        to={to}
        sx={{ margin: 0, padding: 0, display: 'inline', backgroundColor: 'transparent' }}
      >
        <IconButton aria-label={primary} sx={{ margin: 0, padding: 0, ...sx }}>
          {children}
        </IconButton>
      </Button>
    </Tooltip>
  );
}
