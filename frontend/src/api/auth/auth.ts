


import {API_URL} from "../../../config/backend";
import {handleErrorFunction, useError} from "@/context/ErrorContext";
import {useNavigate} from "react-router";


/** --------------------------------------
 * 2차 인증 활성화를 위한 QR코드 생성 API
 * ---------------------------------------*/
export async function getQrCodeToActivate2FactorAuth(handleError: handleErrorFunction) {

  // 서버 qr 요청
  const requestUrl = `${API_URL}/api/user/2fa/qr`;
  const qrCodeResponse = await fetch(requestUrl, {
    method: "GET",
  });

  // on error
  if (!qrCodeResponse.ok) {
    const errorData = await qrCodeResponse.json();
    handleError("2FA", errorData.message);
    return ;
  }

  // on success
  const qrCodeUrl = await qrCodeResponse.text();
  return (qrCodeUrl);
}


/** --------------------------------------
 * 서버에 OTP 토큰을 전송
 * ---------------------------------------*/
export async function submitOtpTokenToServer(handleError: handleErrorFunction, token: string) {

  // 서버에 OTP 제출
  const requestUrl = `${API_URL}/api/user/2fa`;
  const submitResponse = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: token // 6자의 string
  });

  // on error
  if (!submitResponse.ok) {
    const errorData = await submitResponse.json();
    handleError("2FA", errorData.message);
    return ;
  }
}

/** --------------------------------------
 * 2차 인증 끄기
 * ---------------------------------------*/
export async function deactivate2FactorAuth(handleError: handleErrorFunction, token: string) {

  // 서버 qr 요청
  const deactivateUrl = `${API_URL}/api/user/2fa`;
  const submitResponse = await fetch(deactivateUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "text/plain",
    },
    body: token // 6자의 string
  });

  // on error
  if (!submitResponse.ok) {
    const errorData = await submitResponse.json();
    handleError("2FA", errorData.message);
    return ;
  }
}