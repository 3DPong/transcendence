
import { fetchAndHandleResponseError } from "@/api/error/error";

/** API 42
 * @link https://github.com/3DPong/transcendence/discussions/14
 * GET /auth/signin
 * POST /auth/signup
 */

// 로그인
// 200 success

export interface GET_SignInResponseFormat {
  status:   "SUCCESS" /*로그인성공 */ 
          | "SIGNUP_MODE" /*회원가입*/ 
          | "2FA"; /*2차인증(QR코드 받기)*/
  user_id?: number; // SUCCESS일 경우에만 날라옴.
}

export async function requestSignIn() {
  return new Promise<GET_SignInResponseFormat>(async (resolve, reject) => {


    // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch
    /*
    const URL = `/auth/signin`;
    const response = await fetchAndHandleResponseError(URL, { method: "GET", redirect: "follow" });
    if (response) {
      const jsonObjcet = response.json();
      console.log("Response data JSON :"); console.dir(jsonObjcet);
      resolve (jsonObject);
    }
    */



    setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      resolve({ status: "SIGNUP_MODE", user_id: 42 }); // on SUCCESS
      // resolve({ status: "SUCCESS", user_id: 42 }); // on SUCCESS
    }, 500);

  });
};

// ----------------------------
// 1. 2FA로 오면, 아 내가 2차인증을 해야 되는구나, 그럼 창에다가 서버가 준 QR코드를 화면에 보여줌.
// 2. 사용자가 번호를 입력하고 , 엔터 치면 POST로 날라가고, 그럼 다시 성준님이 검증 진행.
// 3. 이 결과가 이제 로그인 성공 여부. (여기서 200받았을 때 home으로 가기)

// ----------------------------
// 1. 일반 로그인 과정은 서버에서 강제 리다이렉트를 시켜주는 거기 때문에 프론트에서 신경쓸 부분은 아니다. (Auth protocol)
// 2. 이 결과가 이제 로그인 성공 여부. (여기서 200받았을 때 home으로 가기)
