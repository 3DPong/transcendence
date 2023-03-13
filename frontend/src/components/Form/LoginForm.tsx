/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LoginForm.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/14 19:14:22 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/04 16:11:51 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useMemo }     from 'react';
import * as Utils       from '@/utils/Validator'
import { TextFields }   from '@/components/Form/TextFields_A';
import { Button }       from '@/components/Form/Button_A';
import { eFormStatus, ValidatorRuleFormat }     from '@/components/Form/type';

// React Router
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // react-router-dom v6의 기능. useHistory는 deprecated됨.


const { ENABLE, DISABLE, ON_PROCESSING } = eFormStatus;
const { NAME_RULE, PASSWORD_RULE } = ValidatorRuleFormat;

export function LogInForm(): JSX.Element
{
    // States for form validation
    const [ _userId, _setUserId ] = useState<string>( '' );
    const [ _userPassword, _setUserPassword ] = useState<string>( '' );
    const [ _formStatus, _setFormStatus ] = useState<eFormStatus>( ENABLE );

    // 최초 렌더링시에만 해당 함수를 호출, 기억해두기 위함. 이 부분은 V-dom update와 관계 없이 일정함.
    const _validator = useMemo(() => { 
        console.log("setting validator...");
        return new Utils.Validator();
    }, []); // calculate on only first render

    function _handleSubmit(event: React.MouseEvent<HTMLButtonElement>)
    {
        event.preventDefault(); // prevent page refreshing.

        if (_formStatus !== eFormStatus.ENABLE) {
            console.log('[dev]: button is disabled. try later');
            return; // do nothing if already on sending data.
        } 

        // 어차피 Async가 promise를 return하니까. 이렇게 하는게 하단 코드보다 더 깔끔하지 않나.
        /*
        const validateFormData = async () => {
             if (!(_validator.isAcceptable("@Name", _userId))) {
                    // Promise.reject(new Error(` invalid Name `))
                    throw (new Error(` invalid Name `));
                }
                else if (!(_validator.isAcceptable("@Password", _userPassword))) {
                    throw (new Error(` invalid Password `))
                } else {
                    return;
                }
        }
        */

        const validateFormData = () => {
            return new Promise<number>((resolve, reject) => {
                if (!(_validator.isAcceptable(NAME_RULE, _userId))) {
                    reject(new Error(` invalid Name `))
                }
                else if (!(_validator.isAcceptable(PASSWORD_RULE, _userPassword))) {
                    reject(new Error(` invalid Password `))
                } else {
                    resolve(1);
                }
            });
        }

        // 문제는 async안에서 async 재호출이 안되네.. 왜지?
        /*
        const doSomethingOnServer = async (_time: number) => {
                setTimeout(() => { return _time }, _time);
            };
        }
        */


        // to add await at async function, you must return Promise object.
        const doSomethingOnServer = (_time: number) => {
            return new Promise<number>((resolve, reject) => {
                setTimeout(() => {
                    resolve(_time);
                }, _time);
            });
        }

        // Send form data to server
        ( async () => {
            _setFormStatus(ON_PROCESSING); // (0) turn on flag to prevent multiple server sending
            try {
                await validateFormData(); // (1) validate form before submission (제출시만 체크)
                await doSomethingOnServer(3000); // (2) send data to server
                alert("[dev]: Submission Success!");
            } catch (e: unknown) {
                if (typeof e === "string") {
                    alert(`[dev]: ${e.toUpperCase}`)
                } else if (e instanceof Error) {
                    alert(`[dev]: ${e.message}`)
                } else {
                    // ...
                }
            }
            _setFormStatus(ENABLE); // (3) restore button status on any case.
        })(/* 즉시 실행 익명 함수 */);
    }

    return (
        <div className="block max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <TextFields
                state={ _userId } setState={ _setUserId }
                type="text" label="42 Intra ID" placeholder="아이디를 입력해주세요"
            />
            <TextFields
                state={ _userPassword } setState={ _setUserPassword } 
                type="password" label="42 Intra Password" placeholder="비밀번호를 입력해주세요"
            />
            <Button   status={ _formStatus } text={ 'LOGIN' } onClick={ _handleSubmit }/>
            <p className="mt-6 text-center text-gray-800">
                    처음이신가요? &nbsp;&nbsp;

                {/* a tag는  페이지 리로딩됨. Router 기능을 쓰려면 Link를 사용할 것. */}
                {/* https://reactrouter.com/en/main/components/link */}

                {/* ! 아니 근데 내가 따로 설정 안했는데 왜 브라우저 뒤로가기가 잘 되냐...? */}

                <Link to={"/signin"} className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700">
                    회원가입
                </Link>
            </p>
        </div>
  );
}