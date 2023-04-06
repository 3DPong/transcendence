
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
