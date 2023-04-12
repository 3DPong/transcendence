/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Pair.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/01 02:05:26 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/01 02:05:34 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface Pair<T0, T1> {
  first: T0;
  second: T1;
}

export function makePair<T0, T1>(a: T0, b: T1) {
  return { first: a, second: b } as Pair<T0, T1>;
}
