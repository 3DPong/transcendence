

import { fetchAndHandleResponseError } from "@/api/error/error";

const SIGNIN_REQUEST = "GET /auth/signin";

export interface POST_SignUpRequestFormat {
  nickname: string,
  profile_url: string,
}


export interface POST_SignUpResponseFormat {} // no data

// https://github.com/3DPong/transcendence/pull/55
// 이 순간은 create session이 쿠키에 담겨있는 상태임.
// 가입할 때는 2단계 Auth가 없음.
// 2단계

export interface POST_uploadImageRequestFormat {}

export interface POST_uploadImageResponseFormat {}


function ArrayBufferToBinay(buffer: ArrayBufferLike) {
  const dataView = new DataView(buffer);
  let binary = "", offset = (8/8);
  for (let i = 0; i < dataView.byteLength; i += offset) {
    binary += dataView.getInt8(i).toString(2);
  }
  return binary;
}

// 최종 편집이 완료된 이미지 바이너리를 보냄.
export async function sendImageToServer(clientSideImageLocation: any) {
  return new Promise<POST_uploadImageResponseFormat>(async (resolve, reject) => {

  // https://stackoverflow.com/questions/35192841/how-do-i-post-with-multipart-form-data-using-fetch
  const formData = new FormData();
  // formData.append("file", imageData);

  // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch
  const URL = `/image`;
  const response = await fetchAndHandleResponseError(URL, { 
    method: "POST", 
    body: formData, // image file (form-data)
    // headers: { "Content-Type": "multipart/form-data" }, // 이 부분 세팅하지 말라는 말이 있음. (https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/)
  });
  if (response) {
    const jsonObjcet = response.json();
    console.log("Response data JSON :"); console.dir(jsonObjcet);
    resolve (jsonObjcet);
  }




  // POST /image
  setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      const server_image_location = clientSideImageLocation;
      resolve(server_image_location); // 테스트용.
    }, 2000);
  });
}

export async function requestSignUp(_nickname: string) {
  return new Promise<POST_SignUpRequestFormat>(async (resolve, reject) => {


    // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch
    /*
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
      resolve({ nickname: _nickname, profile_url: "" });
    }, 2000);

  });
};
