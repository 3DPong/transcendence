/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Validator.config.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/14 19:19:28 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/15 22:44:44 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Memo: dynamic import로 JS 실행 시, 아래 설정파일이 그대로 브라우저에 노출되는 문제가 발생.
//       따라서 transfile시 아래 모듈이 포함되도록 수정하였음.


// @가 반드시 붙은 문자열 타입 지정.
type String_MustStartWith<T extends string> = `${T}${string}`

// 모든 identifier는 '@'로 시작하여야 합니다.
export interface ConfigStruct 
{
    rules : Array< String_MustStartWith<'@'> | RuleConfigObject >[] 
}

export interface RuleConfigObject
{ 
    regex : RegExp;  // required
    hint? : string;  // optional
    // ...
};

export const DefaultConfig : ConfigStruct = {
    rules: [  
        [
            "@Name", // 이름 검증
            { 
                regex : /^[A-Za-z0-9]{5,12}$/,
                hint  : " 영문 대문자, 소문자, 숫자만 사용 가능하며 최소 5자, 최대 12자까지 입력 가능합니다."
            }
        ], 
        [
            "@Password", // 비밀번호 검증
            { 
                regex : /^[A-Za-z0-9]{9,30}$/,
                hint  : " 영문 대문자, 소문자, 숫자만 사용 가능하며 최소 9자, 최대 30자까지 입력 가능합니다."
            }
        ],
        [
            "@BadWords", // 비속어 검증
            { 
                regex : /^[A-Za-z]$/
            }
        ]
    ], 
};
