
import {handleAlertFunction} from "@/context/AlertContext";
import {API_URL} from "../../../config/backend";

export async function submit2FaTokenToServer(handleAlert: handleAlertFunction, token: string) {
  // 서버 qr 요청
  const requestUrl = `${API_URL}/auth/2fa/otp`;
  const requestPayload = {
    token: token
  }

  const submitResponse = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  // on error
  if (!submitResponse.ok) {
    if (submitResponse.status === 401) {
      const errorData = await submitResponse.json();
      handleAlert('2FA', errorData.message, 'signin');
      return ; // null on error
    } else {
      const errorData = await submitResponse.json();
      handleAlert('2FA', errorData.message);
      return ; // null on error
    }
  }
  // on Success
  return submitResponse;
}