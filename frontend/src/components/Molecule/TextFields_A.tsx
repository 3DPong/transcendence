/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TextFields_A.tsx                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/25 15:40:12 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/25 15:41:00 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


type fieldType = 'text' | 'password' | 'radio' | 'number' | 'month' | 'file' | 'email' /* and more... */
// * [How to set up optinal props]
// https://bobbyhadz.com/blog/react-optional-props-typescript
// https://dev.to/fullstackchris/react-with-typescript-optional-props-with-default-values-33nc

// <input> 태그의 type option

interface ITextFieldProps
{
    // Required Props
    state          : string,
    setState       : (arg: string) => void,
    // Optinal Props
    type?          : fieldType, // text or password... etc
    label?         : string,    // 표시할 내용.
    placeholder?   : string,    // 미입력시 기본으로 표시할 내용.
}

/**
 * 
 * @state 
 * @setState
 * 
 * @type <input> tag's type. 'text'
 * @label
 * @placeHolder
 */
export function TextFields({
                            state,
                            setState,
                            label = "Label",
                            placeholder = "Placeholder",
                            type = "text" }: ITextFieldProps)
/* Returns */: JSX.Element
{
    return (
        <div className="mb-6 form-group">
            <label className="inline-block mb-2 text-gray-700 form-label">
                {label}
            </label>
            <input
                type={type}
                value={state} // 작성 시 표시되는 값
                onChange={(event) => {setState(event.target.value)}}
                placeholder={placeholder}
                className="form-control
                            block
                            w-full
                            px-3
                            py-1.5
                            text-base
                            font-normal
                            text-gray-700
                            bg-white bg-clip-padding
                            border border-solid border-gray-300
                            rounded
                            transition
                            ease-in-out
                            m-0
                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
        </div>
    );
}