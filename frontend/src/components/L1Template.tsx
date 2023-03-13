/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Friends.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 01:02:27 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 06:53:38 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Outlet } from "react-router-dom";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

export interface templateProps {
    organism: ReactJSXElement
}

export default function L1Template({organism}: templateProps) {
    return (
        <div className=" absolute left-24 top-5">
            <div className=" shadow-lg w-72">
                {organism}
            </div>s
            <Outlet />
        </div>
    );
}