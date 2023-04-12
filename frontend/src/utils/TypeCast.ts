/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TypeCast.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/01 21:51:48 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/01 22:12:04 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assert } from './Assert';

// 아래 소스를 바탕으로 응용해본 것.
export function dynamic_cast<TargetType extends Object /*JsObject*/>(src: Object) {
  // let returnValue: TargetType = {...object} as TargetType;

  type keyArray = Array<keyof TargetType>;
}

// https://github.com/eezstreet/typescript-cast
// Original Authur : eezstreet
// Tested : x (아직 사용 안해봄.)
export function reinterpretCast<T extends Object>(object: any, options?: any): T {
  let returnValue: T = { ...object } as T;
  if (options === undefined) {
    return returnValue;
  }

  Object.keys(options).forEach((key) => {
    const value = (returnValue as any)[key];
    if (value !== undefined) {
      switch (options[key]) {
        case 'date':
        case 'Date':
          (returnValue as any)[key] = new Date(value);
          break;
        case 'number':
        case 'Number':
          (returnValue as any)[key] = parseInt(value);
          break;
      }
    }
  });
  return returnValue;
}
