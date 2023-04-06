import React, { useState, useRef, forwardRef } from 'react';

// create ref hook component.
// this enables <Component ref={...}/>

const Child = React.forwardRef( (_props, _ref) => {
  const [text, setText] = useState<string>('');

  return (
    <>
    {/* ! 아 안된다 ㅋㅋ 일단 그냥 다른걸로 하자...c */}
    </>
  );
});



export function Parent()
{
  // const [count, setCount] = useState(0);
  const refToChild = useRef(null);

  return (
    <div>
      <p>child's value: {refToChild.current}</p>
      <Child ref={ refToChild } />
    </div>
  );
}

