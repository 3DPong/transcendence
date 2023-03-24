

import { fetchAndHandleResponseError } from "@/api/error/error";
import { Api } from "@mui/icons-material";


// https://github.com/3DPong/transcendence/pull/55
// 이 순간은 create session이 쿠키에 담겨있는 상태임.
// 가입할 때는 2단계 Auth가 없음.
// 2단계

export interface POST_uploadImageResponseFormat {
  body: string;
}


// 최종 편집이 완료된 이미지 바이너리를 보냄.
export async function uploadImageToServer(clientSideImageUrl: string) {
  return new Promise<POST_uploadImageResponseFormat>(async (resolve, reject) => {

  // https://stackoverflow.com/questions/35192841/how-do-i-post-with-multipart-form-data-using-fetch

  /*
  // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch

  const formData = new FormData();
  formData.append("file", imageData);
  const URL = `/image`;
  const response = await fetchAndHandleResponseError(URL, { 
    method: "POST", 
    body: formData, // image file (form-data)
    // headers: { "Content-Type": "multipart/form-data" }, // 이 부분 세팅하지 말라는 말이 있음. (https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/)
  });
  if (response) {
    const jsonObjcet = response.json();
    console.log("Response data JSON :"); console.dir(jsonObjcet);
    resolve(jsonObjcet);
  }
  */

  // POST /image
  setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      const serverSideImageUrl = clientSideImageUrl;
      resolve({ body: serverSideImageUrl }); // 테스트용.
    }, 1000);
  });
}



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
    const serverSideProfileUrl = response.body;
   

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
        profile_url: serverSideProfileUrl,
        wins: 0,
        losses: 0,
        total: 0,
        level: 0,
      };
      resolve(DUMMY_RES);
    }, 1000);

  });
};
