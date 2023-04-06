

import { uploadImageToServer } from "@/api/upload/upload";

// https://github.com/3DPong/transcendence/pull/55
// 이 순간은 create session이 쿠키에 담겨있는 상태임.
// 가입할 때는 2단계 Auth가 없음.
// 2단계

export interface POST_SignUpRequestFormat {
  nickname: string,
  profile_url: string,
}

export interface POST_SignUpResponseFormat {
  user_id: number;
  nickname: string;
  profile_url: string;
  wins: number;
  losses: number;
  total: number;
  level: number;
}

/** API 42
 * @link https://github.com/3DPong/transcendence/discussions/14
 * GET /auth/signin
 * POST /auth/signup
 */

// SUCCESS = 201 Created
export async function requestSignUp(_nickname: string, clientSideImageUrl: string) {
  return new Promise<POST_SignUpResponseFormat>(async (resolve, reject) => {

    // 1. 서버에 프로필 이미지부터 전송.
    const response = await uploadImageToServer(clientSideImageUrl);
    const serverSideImageUrl = response.body;

    // 2. 서버의 이미지 src를 받은 후 그걸로 회원가입 처리 진행.
    /*
    // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch
    const SIGNIN_REQUEST = "POST /auth/signup";
    const URL = `/user/search/${searchString}`;
    const response = await fetchAndHandleResponseError(URL, { method: "GET" });
    if (response) {
      const jsonObjcet = response.json();
      console.log("Response data JSON :"); console.dir(jsonObjcet);
      resolve (jsonObjcet);
    }
    */
   
    setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      const DUMMY_RES: POST_SignUpResponseFormat = {
        user_id: 42,
        nickname: _nickname,
        profile_url: serverSideImageUrl,
        wins: 0,
        losses: 0,
        total: 0,
        level: 0,
      };
      resolve(DUMMY_RES);
    }, 1000);

  });
};
