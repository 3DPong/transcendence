/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   L1Template.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 01:02:27 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 21:41:09 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Outlet } from "react-router-dom";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import ButtonLink from "@/components/Molecule/Link/ButtonLink";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";

export interface templateProps {
  organism: ReactJSXElement;
}

export default function L1Template({ organism }: templateProps) {
  return (
    <div className=" absolute left-24 top-5">
      <div className=" shadow-lg w-72">
        {organism}
        <div className=" absolute right-1 top-1">
          {" "}
          {/* 뒤로가기 버튼. */}
          <ButtonLink
            primary="close"
            to="../"
            children={<CloseIcon fontSize="small" />}
            sx={{ color: "rgba(100,100,100,0.8)" }}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
