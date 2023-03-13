    
// ----------------------------------
// * Login Page 구현하기
// Ref (1) : https://reactjs.org/docs/forms.html
// Ref (2) : https://www.daleseo.com/react-forms/



// ! 다 했다. 그리고 useRef를 안쓰고 했는데도, 부모가 re-render 되지 않는게 신기하긴함.. React가 바뀐 부분만 처리해서 그런건가?
// React의 최적화 때문인가...

import { useState, useEffect } from 'react';
/*
function NameForm() : JSX.Element
{

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
*/

type customProps = {
    state          : string,
    onChange       : (arg: string) => void,
}

function PasswordForm( _props: customProps ): JSX.Element
{
    function _handleChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        _props.onChange(event.target.value);
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
          value={ _props.state } // 작성 시 표시되는 값
          onChange={ _handleChange } // 내부에서 props로 전달한 부모의 handler 실행.
          placeholder="비밀번호를 입력해주세요"
        />
      </div>
    );
}



// -------------------------------------------------------------------------------
// * 다 좋다! 근데 LoginForm에서 자식 Component의 State을 접근해야 이걸 제출할 수 있다.
//   그런데 문제가 있다.
//   (0) 배경: 부모는 Submit button이 눌렸을 때 자식 컴포넌트의 값(State)을 끌고온다. (실제 제출) 

//   (1) 자식의 State이 바뀌면, 해당 자식 Component만 re-render 되야 한다. 부모는 다시 렌더할 이유가 없다.

//   (2) 해결안 1.  State을 부모에서 선언하고 자식에게 그 handler만 props로 전달한다.
//                그 후 자식의 onChange 콜백에 부모의 handler를 넣어주면, 자식의 event로 부모가 없데이트 된다
//       -- 이 방식의 문제점 : 입력할 때 마다 부모가 통째로 Re-render 된다.

//   (3) 해결안 2.  

// https://stackoverflow.com/questions/27864951/how-to-access-a-childs-state-in-react
// -------------------------------------------------------------------------------


export function LoginForm() : JSX.Element // 리턴 값은 그냥 공부용으로 적어봄. 의미는 없음.
{
    const [_password, _setPassword] = useState<string>('');
    const [_id, _setId] = useState<string>('');

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
        {/* <NameForm /> */}
        <PasswordForm state={ _password } onChange={ _setPassword }/>
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