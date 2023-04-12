/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AddFriends.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 01:02:27 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 06:54:11 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import ButtonLink from '@/components/Molecule/Link/ButtonLink';
import CloseIcon from '@mui/icons-material/Close';

export interface templateProps {
  organism: ReactJSXElement;
}

export default function L3Template({ organism }: templateProps) {
  return (
    <div className=" absolute left-96 top-0 shadow-lg w-72">
      {organism}
      <div className=" absolute right-2 top-1">
        {' '}
        {/* 뒤로가기 버튼. */}
        <ButtonLink primary="close" to="../" children={<CloseIcon fontSize="small" />} />
      </div>
    </div>
  );
}
