import { API_URL } from '../../../config/backend';
import { handleAlertFunction, useAlert } from '@/context/AlertContext';

export interface POST_uploadImageResponseFormat {
  body: string;
}

// 최종 편집이 완료된 이미지 바이너리를 보냄.
export async function uploadImageToServer(handleAlert: handleAlertFunction, clientSideImageUrl: string) {

  // Base64 image를 binary로 바꿔서 전송하는 방법.
  // https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  const formData = new FormData();
  const blob = await (await fetch(clientSideImageUrl)).blob();
  formData.append('file', blob);
  const requestUrl = `${API_URL}/image`;
  const uploadResponse = await fetch(requestUrl, {
    method: 'POST',
    body: formData, // image file (form-data)
    // headers: { "Content-Type": "multipart/form-data" }, // 이 부분 세팅하지 말라는 말이 있음.
    // (https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/)
  });
  // on error
  if (!uploadResponse.ok) {
    if (uploadResponse.status === 401) {
      const errorData = await uploadResponse.json();
      handleAlert('Image Upload', errorData.message, 'signin');
      return ; // null on error
    } else {
      const errorData = await uploadResponse.json();
      handleAlert('Image Upload', errorData.message);
      return ; // null on error
    }
  }

  // on success
  const serverSideImageUrl = await uploadResponse.text();
  console.log('ServerSideImageUrl', serverSideImageUrl);
  return serverSideImageUrl;
}


/*******************
 *    닉네임 중복 검사
 *******************/
interface verifyResponse {
  isDuplicate: boolean;
}
export async function verifyNickname(handleAlert: handleAlertFunction, name: string) {
  const requestUrl = `${API_URL}/user/verify/nickname/${name}`;
  const response = await fetch(requestUrl, {
    method: 'GET'
  })
  if (!response.ok) {
    const errorData = await response.json();
    handleAlert('Verify Nickname', errorData.message);
    return ; // null on error
  }
  const responsePayload: verifyResponse = await response.json();
  return (!responsePayload.isDuplicate);
}
