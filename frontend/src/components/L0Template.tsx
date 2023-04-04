/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Home.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/12 23:12:14 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 06:21:59 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Outlet } from "react-router-dom";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import AlertSnackbar from "@/components/Molecule/AlertSnackbar";


export interface templateProps {
    organism: ReactJSXElement
}


export default function L0Template({organism}: templateProps) {

    return (
        <div> 
            {organism}
            <Outlet />
            <AlertSnackbar/>
        </div>
    );
}