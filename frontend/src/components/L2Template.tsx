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

import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";


export interface templateProps {
    organism: ReactJSXElement
}

export default function L2Template({organism}: templateProps) {
    return (
        <div className=" absolute left-80 top-0 shadow-lg w-72">
            {organism}
        </div>
    );
}