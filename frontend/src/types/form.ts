/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   type.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/25 15:29:17 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/28 01:38:22 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export enum eFormStatus {
    ENABLE = 0,      // if state is normal.
    DISABLE,         // if state is 오류/금지/에러
    ON_PROCESSING,   // if state is 처리중.
}

export namespace ValidatorRuleFormat
{
    export const NAME_RULE = "@Name";
    export const PASSWORD_RULE = "@Password";
}