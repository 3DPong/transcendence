/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Assert.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/14 19:14:02 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/28 17:07:38 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/** [ How to Why we need assert() ]
-------------------------------------------------------------------------
*    : https://mariusschulz.com/blog/assertion-functions-in-typescript
*      The ! operator is completely erased when our TypeScript code is compiled to JavaScript.
*      The non-null assertion operator has no runtime manifestation whatsoever.
*
*      이 namespace는 전역으로 include 해서 사용할 Assert function 모음집입니다.
*      typescript에서 아래 함수를 사용하면, 그 하단의 코드 타입을 확정시킬 수 있습니다. (런타임 타입 안전성)
*/
import * as assertModule from 'assert';

export namespace Assert {
  /**
   * 이 함수는 타입에서 null/undefined이 없음을 (런타임 차원에서) 단언합니다.
   * async로 데이터를 받아올 경우, 해당 데이터가 null/undefined가 아님을 단언합니다.
   * 이 방법은 runtime에서 타입을 단언하기 위한 [ (!)operator ] 대체안입니다.
   * @param value assert할 값
   * @param message throw할 message
   */
  export function NonNullish<T>(value: T, _message?: string): asserts value is NonNullable<T> {
    // assertion signature
    if (value === null || value === undefined) {
      throw new assertModule.AssertionError({
        message: _message,
      });
    }
  }

  export const MustBeTrue = (condition: boolean, _message: string) => {
    if (condition === false) {
      throw new assertModule.AssertionError({
        message: _message,
      });
    }
  };

  /**
   * Adapted from https://github.com/sindresorhus/float-equal
   * License evidence: https://github.com/sindresorhus/float-equal/blob/master/license
   * @author Sindre Sorhus + fork contributions from Alex Birch
   * @license MIT
   */
  export const FloatEqual = (a: number, b: number, tolerance: number = Number.EPSILON): void => {
    if (a === b) {
      return;
    }

    const diff: number = Math.abs(a - b);
    if (diff < tolerance) {
      return;
    }
    if (diff <= tolerance * Math.min(Math.abs(a), Math.abs(b))) {
      return;
    }
    throw new assertModule.AssertionError({
      operator: `within ${tolerance} of`,
      expected: `${b} (difference: ${diff})`,
      actual: a,
    });
  };
}
