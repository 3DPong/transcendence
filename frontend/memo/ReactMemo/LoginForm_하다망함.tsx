    
// ----------------------------------
// * Login Page 구현하기
// Ref (1) : https://reactjs.org/docs/forms.html
// Ref (2) : https://www.daleseo.com/react-forms/

import { useState, useEffect } from 'react';

function NameForm() : JSX.Element
{
    const [_id, setId] = useState<string>('');

    function _handleChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        setId(event.target.value);
    }

    return (
      <div className="mb-6 form-group">
        <label className="inline-block mb-2 text-gray-700 form-label">
          Your ID
        </label>
        <input
          type="email"
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
          value={ _id } // 작성 시 표시되는 값
          onChange={ _handleChange }
          placeholder="ID를 입력해주세요"
        />
      </div>
    );
}

function PasswordForm() : JSX.Element
{
    const [_password, setPassword] = useState<string>('');

    function _handleChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        setPassword(event.target.value);
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
          value={ _password } // 작성 시 표시되는 값
          onChange={ _handleChange }
        //   onChange={ event => console.log(event) } --> 이렇게 하면 파라미터 타입을 체크할 수 있음.
          placeholder="비밀번호를 입력해주세요"
        />
      </div>
    );
}



// -------------------------------------------------------------------------------
// * 다 좋다! 근데 LoginForm에서 자식 Component의 State을 접근해야 이걸 제출할 수 있다.
// * 이걸 어떻게 해결해야 할지 난감하다. useState을 쓰면 안되는 것인가?
// https://stackoverflow.com/questions/27864951/how-to-access-a-childs-state-in-react
// -------------------------------------------------------------------------------

export function LoginForm() : JSX.Element // 리턴 값은 그냥 공부용으로 적어봄. 의미는 없음.
{

    function _handleSubmit(event: any)
    {
        // console.log(`Submit result: name=${_userInput?.id}, password=${_userInput?.password}`)

        // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        // form 안에 submit 역할을 하는 버튼을 눌렀어도 새로 실행하지 않도록 설정. (submit은 작동됨)
        event.preventDefault();
        // ... send data to server ... etc
    }


    // HTML의 Form Tag는 자체 State을 가지는 특별 태그이다.
    // React에서 이걸 그대로 써도 되지만, React에서 사용자 입력을 접근할 수 있게 할 수 있다.
    // 바로 Controlled Components (제어 컴포넌트) 라는 기술이다.
    // Ref : https://ko.reactjs.org/docs/forms.html

    return (
    <div className="block max-w-sm p-6 bg-white rounded-lg shadow-lg">
    <form onSubmit={ _handleSubmit }>
        <NameForm />
        <PasswordForm />
      <button type="submit" className="
        w-full
        px-6
        py-2.5
        bg-blue-600
        text-white
        font-medium
        text-xs
        leading-tight
        uppercase
        rounded
        shadow-md
        hover:bg-blue-700 hover:shadow-lg
        focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0
        active:bg-blue-800 active:shadow-lg
        transition
        duration-150
        ease-in-out">Sign in</button>

      <p className="mt-6 text-center text-gray-800">
            처음이신가요? &nbsp;&nbsp;
      <a href="#!"
         className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700">
            회원 가입
        </a>
      </p>

    </form>
  </div>
  );
}