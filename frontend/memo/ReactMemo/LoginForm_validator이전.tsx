import { useState, useEffect, isValidElement } from 'react';


/**
 * 
 *  NOTE 1: 고민. 아래처럼 구현할 경우, 비밀번호 입력시 LoginForm 컴포넌트가 계속 re-render됨
 *  --------------------------------------------------------------------------------
 * 
 *        - 해결책 : state을 ID, PASS 컴포넌트 각각에 저장하고, 부모는 제출버튼 클릭시
 *                  자식 Component에게 State을 받아서 업데이트할 수 있다.
 *                  이렇게 하면 부모는 re-render가 되지 않는다
 * 
 *        - 단점   : 이걸 구현하려면 useRef와 useImperativeHandle을 써야 한다. 
 *                  그런데 위 두개를 쓰는 설계는 React 공식문서에서 지양하라고 한다. 
 *                  리액트 답지 않은 설계라고 하더라... 
 *                  
 *        - 결론   : 일단 기본부터 해보자는 생각. 부모에 State을 다 저장했고
 *                  이로 인해 발생하는 부모의 Re-rendering은 일단 냅뒀다. 
 *                  (+) button 비활성화를 위해 state 추가했음. 이 부분도 마찬가지 문제. 
 *                      추후에 이 부분을 토의해봐야겠다...
 * 
 *  NOTE 2: 버튼이 State에 따라 회전하고 색 바뀌고 하려면, 지금 구조를 css 기반 namespace에서
 *  Component 기반으로 변경해야 할 듯 하다. --> button component 제작 필요성.
 *  --------------------------------------------------------------------------------
 * 
 * 
 * 
 * 
 */


/**
 * 
 */
type t_UserData = {
    Id         : string,
    Password   : string,
}

/**
 * 
 */
type t_Props = {
    state          : t_UserData,
    setState       : (arg: t_UserData) => void,
}

/**
 * 
 * @param _props 
 * @returns 
 */
function IdForm( _props: t_Props ): JSX.Element
{
    function _handleChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        // Form 입력에서만 쓰이기에 일반함수로 작성해서 메모리에 계속 올릴 필요가 없다고 판단, 익명함수로 사용.
        const newId = event.target.value;
        const getUpdatedUserData = (__arg: t_UserData): t_UserData => {
            return ({
                ...__arg, // spread operator, shallow copy!
                Id : newId,
            });
        }
        _props.setState( getUpdatedUserData(_props.state) ); // update된 R-value를 다시 덮어쓰기.
    }

    return (
      <div className="mb-6 form-group">
        <label className="inline-block mb-2 text-gray-700 form-label">
          Your ID
        </label>
        <input
          type="text"
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
          value={ _props.state.Id } // 작성 시 표시되는 값
          onChange={ _handleChange }
          placeholder="ID를 입력해주세요" />
      </div>
    );
}


/**
 * 
 * @param _props 
 * @returns 
 */
function PasswordForm( _props: t_Props ): JSX.Element
{
    function _handleChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        // Form 입력에서만 쓰이기에 일반함수로 작성해서 메모리에 계속 올릴 필요가 없다고 판단, 익명함수로 사용.
        const newPassword = event.target.value;
        const getUpdatedUserData = (__arg: t_UserData): t_UserData => {
            return ({
                ...__arg, // spread operator, shallow copy!
                Password : newPassword,
            });
        }
        _props.setState( getUpdatedUserData(_props.state) ); // update된 R-value를 다시 덮어쓰기.
    }

    return (
      <div className="mb-6 form-group">
        <label className="inline-block mb-2 text-gray-700 form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control block
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
          value={ _props.state.Password } // 작성 시 표시되는 값
          onChange={ _handleChange } // 내부에서 props로 전달한 부모의 handler 실행.
          placeholder="비밀번호를 입력해주세요"
        />
      </div>
    );
}

enum e_Status {
    ENABLE = 0,      // if state is normal.
    DISABLE,         // if state is 오류/금지/에러
    ON_PROCESSING,   // if state is 처리중.
}

type t_ButtonProps = {
    status : e_Status,
    message : string,
}

/**
 * 부모 컴포넌트의 state을 받아서,, 그 state에 따라 버튼이 다양한 모양을 취하도록 한다.
 * @param state - 
 * @param message - 
 */
function CustomButton({ status, message: message }: t_ButtonProps)
    : /* returns */ JSX.Element 
{
    // Use conditional rendering
    // Ref : https://reactjs.org/docs/conditional-rendering.html
    return (
        <button
         type="submit"
         className={ __STYLE.BUTTON.enabled }
         disabled={ status !== e_Status.ENABLE }> 
            { message }
        </button>
    );
}


enum eErrorCode {
    ID_IS_SHORT,
    PS_IS_SHORT,
    PS_RULE_UNMATCHED, // 비밀번호 설정 규칙을 어김.
}


/**
 * 
 * @returns 
 */
export function LoginForm(): JSX.Element
{
    const [ _userData, _setUserData ] = useState<t_UserData>( { Id:'', Password:'' } );
    const [ _formStatus, _setFormStatus ] = useState<e_Status>( e_Status.ENABLE );


    function _handleSubmit(event: React.FormEvent<HTMLFormElement>)
    {
        event.preventDefault(); // prevent page refreshing.

        if (_formStatus !== e_Status.ENABLE) {
            console.log('[dev]: button is disabled. try later');
            return; // do nothing if already on sending data.
        }

        console.log(`ID : ${_userData.Id}\nPS : ${_userData.Password}`);

        // to add await at async function, you must return Promise object.
        const doSomethingOnSever = (_time: number) => {
            return new Promise<number>((resolve, reject) => {
                setTimeout(() => {
                    /* if (...) */ resolve(_time);
                    /* if (...) reject(_time); */
                }, _time);
            });
        }

        const validateFormData = () => {
            // ...
            return new Promise<number>((resolve, reject) => {
                
                let validate_status = 0;

                // Ref : https://www.w3resource.com/javascript/form/password-validation.php
                const PASSWORD_RULE= /^[A-Za-z]\w{7,14}$/;
                // const ID_RULE= ...


                if (_userData.Password.match(PASSWORD_RULE) === null)
                {
                    throw eErrorCode.PS_IS_SHORT;
                }

                // (1) 입력값 길이 범위
                if (_userData.Id.length < 5) {
                    throw eErrorCode.ID_IS_SHORT;
                } else if (_userData.Password.length < 8) {
                    throw eErrorCode.PS_IS_SHORT;
                } 


















                if (false) { // just for test. 
                    reject(new Error(`error code : ${validate_status}`))
                } else {
                    resolve(1);
                }

            });
        }

        // IIFE - send form data to server
        const submitData = (async () => {
            // (0) turn on flag to prevent multiple server sending
            _setFormStatus(e_Status.ON_PROCESSING);

            try {
            // (1) validate form before submission (제출시만 체크)
                await validateFormData();
            // (2) send data to server
                await doSomethingOnSever(3000);
                alert("[dev]: Submission Success!");
            } catch (e: unknown) {
                if (typeof e === "string") {
                    alert(`[dev]: ${e.toUpperCase}`)
                } else if (e instanceof Error) {
                    alert(`[dev]: ${e.message}`)
                } else {
                    let message: string;
                    switch(e)
                    {
                    case eErrorCode.ID_IS_SHORT:
                        message = '(수정) 아이디 길이 메시지'
                        break;
                    case eErrorCode.PS_IS_SHORT:
                        message = '(수정) 아이디 길이 메시지'
                        break;
                    default:
                        message = '(수정) undefined'
                    }
                    alert(message);
                }
                // ... handle other error types
            }
            // (3) restore button status on any case.
            _setFormStatus(e_Status.ENABLE);

        })(/* IIFE */);

    }

    return (
        <div className="block max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <form onSubmit={ _handleSubmit }>
                <IdForm         state={ _userData } setState={ _setUserData } />
                <PasswordForm   state={ _userData } setState={ _setUserData } />
                <CustomButton   status={ e_Status.ENABLE } message={ 'login' } />
                <p className="mt-6 text-center text-gray-800">
                        처음이신가요? &nbsp;&nbsp;
                    <a href="#!" className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700">
                        회원 가입 </a>
                </p>
            </form>
        </div>
  );
}

/**
 * 그냥 이렇게도 할 수 있길래 해보았다...
 * 찾아보니 namespace 는 파일간 합치기도 가능해서 마치 모듈처럼 사용 가능하더라.
 * Ref: https://www.typescriptlang.org/ko/docs/handbook/namespaces.html
 */
namespace __STYLE
{
    export namespace BUTTON
    {
        // style when button is active
        export const enabled = [
            'w-full',
            'px-6',
            'py-2.5',
            'bg-blue-600',
            'text-white',
            'font-medium',
            'text-xs',
            'leading-tight',
            'uppercase',
            'rounded',
            'shadow-md',
            'hover:bg-blue-700 hover:shadow-lg',
            'focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0',
            'active:bg-blue-800 active:shadow-lg',
            'transition',
            'duration-150',
            'ease-in-out'
            ].join(' ');

        // 버튼이 사용 금지일 때 적용할 style.
        export const disabled = [
            'w-full',
            'px-6',
            'py-2.5',
            'bg-blue-600',
            'text-white',
            'font-medium',
            'text-xs',
            'leading-tight',
            'uppercase',
            'rounded',
            'shadow-md',
            'hover:bg-blue-700 hover:shadow-lg',
            'focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0',
            'active:bg-blue-800 active:shadow-lg',
            'transition',
            'duration-150',
            'ease-in-out'
            ].join(' ')

        // 데이터가 처리되고 있을 때 (ex. 서버 전송) 적용할 style
        export const onProcessing = [
            'w-full',
            'px-6',
            'py-2.5',
            'bg-gray-600',
            'text-white',
            'font-medium',
            'text-xs',
            'leading-tight',
            'uppercase',
            'rounded',
            'shadow-md',
            // 'spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full',
            // 'hover:bg-gray-700 hover:shadow-lg',
            // 'focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0',
            // 'active:bg-gray-800 active:shadow-lg',
            // 'transition',
            // 'duration-150',
            // 'ease-in-out'
            ].join(' ')



    }
}