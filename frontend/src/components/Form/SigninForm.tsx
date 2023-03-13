/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SigninForm.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/14 19:14:22 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/28 01:36:44 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useEffect, useMemo }     from 'react';
import * as Utils       from '@/utils/Validator'
import { TextFields }   from '@/components/Form/TextFields_B';
import { Button }       from '@/components/Form/Button_A';
import { eFormStatus, ValidatorRuleFormat }     from '@/components/Form/type';

const { ENABLE, DISABLE, ON_PROCESSING } = eFormStatus;
const { NAME_RULE, PASSWORD_RULE } = ValidatorRuleFormat;

export function SignInForm(): JSX.Element
{

    // States for Id
    const [ _userId, _setUserId ] = useState<string>( '' );
    const [ _userIdStatus, _setUserIdStatus ] = useState<eFormStatus>( DISABLE );

    // States for Password
    const [ _userPassword, _setUserPassword ] = useState<string>( '' );
    const [ _userPasswordStatus, _setUserPasswordStatus ] = useState<eFormStatus>( ENABLE );

    // States for Button
    const [ _formStatus, _setFormStatus ] = useState<eFormStatus>( ENABLE );

    // Validator instance with useMemo. V-dom update랑 관계없이 항상 보유.
    const _validator = useMemo(() => { 
        console.log("setting validator...");
        return new Utils.Validator();
    }, []) // calculate only on first render.


    // 회원가입 시는 입력할 때 마다 검증!
    const _isBothEnabled = (s1: eFormStatus, s2: eFormStatus) => {
        return (s1 === ENABLE && s2 === ENABLE);
    }

    useEffect(() => {
        _setUserIdStatus( _validator.isAcceptable(NAME_RULE, _userId) ? ENABLE : DISABLE );
        _setUserPasswordStatus( _validator.isAcceptable(PASSWORD_RULE, _userPassword) ? ENABLE : DISABLE );
        _setFormStatus( _isBothEnabled(_userIdStatus, _userPasswordStatus) ? ENABLE : DISABLE );
        }, [ _userId, _userPassword, _userIdStatus, _userPasswordStatus ]);

    function _handleSubmit(event: React.MouseEvent<HTMLButtonElement>)
    {
        event.preventDefault(); // prevent page refreshing.

        if ((_userIdStatus !== ENABLE) && (_userPasswordStatus !== ENABLE)) {
            console.log('[dev]: button is disabled. try later');
            return; // do nothing if already on sending data.
        }

        // to add await at async function, you must return Promise object.
        const doSomethingOnSever = (_time: number) => {
            return new Promise<number>((resolve, reject) => {
                setTimeout(() => {
                    /* if (...) */ resolve(_time);
                    /* if (...) reject(_time); */
                }, _time);
            });
        }

        // Send form data to server
        ( async () => {
            _setFormStatus(ON_PROCESSING); // (0) turn on flag to prevent multiple server sending
            try {
                // await validateFormData(); // (1) validate form before submission (제출시만 체크)
                await doSomethingOnSever(3000); // (2) send data to server
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
                    state={ _userId } setState={ _setUserId } status={ _userIdStatus }
                    type="text" label="42 Intra ID"
                    helperText={ _validator.getRuleHint(NAME_RULE) }
                />
                <TextFields 
                    state={ _userPassword } setState={ _setUserPassword } status={ _userPasswordStatus }
                    type="password" label="42 Intra Password" 
                    helperText={ _validator.getRuleHint(PASSWORD_RULE) }
                />
                <div className="h-5"></div>
                <Button   status={ _formStatus } text={ 'SIGN IN' } onClick={ _handleSubmit } />
        </div>
  );
}