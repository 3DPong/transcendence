
/**
 * 1. [ How to Re-fresh ]
 *    2단계 Auth를 설정하면, 로그인을 처음부터 다시 하도록 요청해야함. 따라서 이 경우 /login 페이지로 초기화할 것 (+ State 초기화 필요!)
 *    단 중간에 refresh 방지용 session storage가 set-up되어 있기에, 페이지 새로고침으로는 초기화가 되지 않을 것
 *    따라서, 이 부분은... userId만 초기화해주고 나머지는 유지하는 방식으로 해야 함...
 * 
 *    아니지. 그냥 page refresh를 하고, 세션스토리지에 저장되는 애는 user_id 밖에 없기 때문에, 
 *    이것만 상태 지우고 강제 refresh(window.reload())하면 된다.
 */

export function Setting() {
    return (
        <div>
            Setting Component
        </div>
    );
}