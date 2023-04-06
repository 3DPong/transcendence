import { useEffect, useState } from "react";

// * 아래는 function component의 예시입니다.
export function Counter(props : any) // 혹은 { message } 로 오브젝트를 분해해서 넣을 수도 있음.
{
    const [count, setCount] = useState(0);
    // const [object, setCount] = useState({}); // * if object state

    // Effect Hook을 사용하면 함수 컴포넌트에서 side effect를 수행할 수 있습니다.
    useEffect(() => {
        console.log(`You clocked ${count} times`);
        // 컴포넌트가 마운트 된 이후,
        // 의존성 배열에 있는 변수들중 하나라도 값이 변경되었을 때 실행되며
        // 의존성 배열에 빈 배열을 넣을 경우 마운트와 언마운트시에 단 한번씩만 실행된다.
        // 의존성 배열 생략 시 컴포넌트 업데이트 시마다 실행됨.

        // return () -> { ... }   // * 이건 컴포넌트가 마운트 해제되기 전에 실행됨.
    });

    // ! 만약 message가 null이면? 
    const handleClick = () => {
        setCount(count + 1); // State을 직접 수정하면 re-render가 되지 않는다. 따라서 setCount 를 통해야 햔다.
    }

    return (
        <div className="btn-primary w-fit">
            <h1>{count}</h1>
            <button onClick={handleClick}>{props.message}</button>
        </div>
    );
}