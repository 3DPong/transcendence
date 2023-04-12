/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useArray.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/17 23:35:56 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/19 11:30:25 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState } from 'react';

/**
 * @ImprovementsNeeded
 * ------------------------------------------------------------
 *
 *  -  Draft를 처음에 만들 때 state 전체를 Deep-copy 할 필요가 없다.
 *     내가 예를 들어 state.foo.bar = "other" 로 바꾸려고 한다 치자.
 *     immuatble로 보호해야 하는 값은 바꿀 값인 그 부모인 state.foo 뿐이다.
 *     내가 바꿀 값만 깊은복사하고, 그 외에는 reference로 처리해도 된다.
 *
 *  -  사용자가 draft.foo.bar 처럼 사용할 수 있게끔 인터페이스를 제공하는게 좋은 UX이다.
 *     따라서 사용방법은 이와 동일하게 고정할 것.
 *
 *  -  그럼 draft.foo.bar = 1 같이 사용 가능하도록 draft proxy를 만들어야 하나?
 *     immer.js는 어떻게 처리하는지 더 분석해야 겠다.
 */

/**
 * @Typescript 구현하면서 배운 것.
 * ------------------------------------------------------------
 *
 * @Subject How to Safely Upcast, Type-check?
 *  - https://toss.tech/article/typescript-type-compatibility
 *  - https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html
 *
 * @Subject How to Update Array State
 *  - https://react.dev/learn/updating-arrays-in-state
 *
 * @Subject Good Study Library of Immutatable states
 *  - https://github.com/immerjs/immer
 *  - https://egghead.io/lessons/javascript-capture-application-logic-in-pure-functions-to-create-immutable-state
 *
 */

// <Foo extends Bar> 를 하려면, Bar는 interface로 할 것.
interface ObjectLiteral {
  [key: string]: any;
}

// useArray가 반환하는 update 함수의 오버로딩 프로토타입 정의
export type UpdateFunctionOverload<T> = {
  // overload 1
  (edit: (draft: T[]) => void): /*return*/ void;
  // overload 2
  (array: T[]): /*return*/ void;
};

export type useArrayPair<T> = [Array<T>, UpdateFunctionOverload<T>];

/**
 * @Description
 * - useArray는 Nested object들의 배열 State을 편하게 사용하기 위한 Custom Hook입니다.
 *  Immerjs API와 그 역할과 목적이 동일하나... 성능은 나쁩니다. (약간 libft vs libc 느낌?)
 *  성능이 중요하다면 Immerjs를 쓰는 걸 권장합니다 (최상단에 링크 올려둠)
 * @Why
 * - nested object를 배열의 원소로 사용하는 경우, 원소의 깊은 복사와 내부 값 변경은 불편합니다.
 *   useArray은 ```State-Array of nested objects``` 에 대한 처리를 편리하게 하고자 구현하였습니다.
 * @Link https://stackoverflow.com/questions/43040721/how-to-update-nested-state-properties-in-react
 *
 * @Param ```initialGroup?``` 초기화할 상태배열 값
 *
 * @HowToUse
 * ```
 * // useArray는 아래처럼 사용합니다. (useState과 유사함)
 * type Book_t = { name: Jack, info: { foo: "1", bar: "2", other: {other_foo: "3", other_bar: "4"} } }
 * const [manyBooks, updateBooks] = useArray< Book_t >();
 *
 * // 미리 만들어둔 배열을 초기화 값으로 설정할 수 있습니다.
 * const preloaded_books: Book_t[] = [bookA, bookB, bookC, ...]; // 미리 설정한 배열
 * const [manyBooks, updateBooks] = useArray< Book_t >( preloaded_books ); // 초기화
 *
 * // info.foo의 값이 "1"인 book의 info.other.other_bar의 값만 "5"로 바꾸고 싶을 때
 * updateBooks((draft) => {
 *     const targetBook = draft.find((book) => book.info.foo === "1");
 *     if (targetBook)
 *       targetBook.info.other.other_bar = "5";
 * });
 *
 * // manyBooks 배열을 미리 준비해둔 배열 값으로 덮어쓰고 싶을 때 (overloaded function)
 * updateBooks( preloaded_books ); // 초기화를 처음에 할지 나중에 할지 차화일 뿐, 예시 1번과 같은 기능입니다.
 *
 * ```
 *
 * @Returns
 * ```
 * [ S[]: 상태배열 , UpdateState<S>: update함수 ]
 * ```
 */
export default function useArray<S extends ObjectLiteral>(initialState?: Array<S>): /*return*/ useArrayPair<S> {
  const [__array, __setArray] = useState<Array<S>>(initialState ? initialState : []);

  // helper function (deep copy)
  function __getDeepCopiedObject(object: ObjectLiteral): /*return*/ ObjectLiteral {
    // https://stackoverflow.com/questions/52616172/how-to-initialize-an-object-in-typescript
    const copyObj: typeof object = {};
    for (const key in object) {
      if (typeof object[key] == 'object' && key != null) {
        copyObj[key] = __getDeepCopiedObject(object[key]); // 재귀적 호출.
      } else {
        copyObj[key] = object[key];
      }
    }
    return copyObj;
  }

  /**
   * - 상태 배열의 원소를 업데이트합니다.
   *   draft는 원본 State객체를 깊은 복사한 Immuatable Object입니다.
   *   사용방법은 아래와 같습니다.
   *
   * @UpdatePatterns
   * ```
   * // add at back
   * update(draft => {
   *     draft.push({id: "id3", done: false, body: "Buy bananas"})
   * })
   *
   * // insert at index (Ex. by index 3)
   * update(draft => {
   *     draft.splice(3, 0, {id: "id3", done: false, body: "Buy bananas"})
   * })
   *
   *
   * // add item at the beginning of the array
   * update(draft => {
   *     draft.unshift({id: "id3", done: false, body: "Buy bananas"})
   * })
   *
   * // update by object value (Ex. user.name )
   * update(draft => {
   *     const index = draft.findIndex(user => user.name === "Jack");
   *     if (index !== -1) draft[index].name = "Smith";
   * })
   *
   * // remove last item
   * update(draft => { draft.pop() })
   *
   * // delete by index (Ex. by index 3)
   * update(draft => { draft.splice(3, 1) })
   *
   * // delete by id
   * update(draft => {
   *     const index = draft.findIndex(todo => todo.id === "id1")
   *     if (index !== -1) draft.splice(index, 1)
   * })
   *
   * // update by id
   * update(draft => {
   *     const index = draft.findIndex(todo => todo.id === "id1")
   *     if (index !== -1) draft[index].done = true
   * })
   *
   * ```
   * @More https://immerjs.github.io/immer/update-patterns
   *
   */
  function update(param: ((draft: S[]) => void) /*function*/ | S[] /*array*/): void {
    if (typeof param === 'function') {
      // create newState by deep copying original state
      const newArr = __array.map((arrElem: ObjectLiteral) => {
        return __getDeepCopiedObject(arrElem) as S;
      });
      param(newArr); // param is "edit()" function. change newState's value
      __setArray(newArr); // set newState
    } else if (Array.isArray(param)) {
      __setArray(param); // update whole
    }
  }

  return [__array, update];
}
