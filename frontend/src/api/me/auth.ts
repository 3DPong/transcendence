import { API_URL } from '../../../config/backend';
import { handleErrorFunction, useError } from '@/context/ErrorContext';
import { useNavigate } from 'react-router';

/** --------------------------------------
 * 2차 인증 활성화를 위한 QR코드 생성 API
 * ---------------------------------------*/
export async function getQrCodeBefore2FaActivation(handleError: handleErrorFunction) {
  // 서버 qr 요청
  const requestUrl = `${API_URL}/user/me/2fa/qr`;
  const qrCodeResponse = await fetch(requestUrl, {
    method: 'GET',
  });

  // on error
  if (!qrCodeResponse.ok) {
    const errorData = await qrCodeResponse.json();
    handleError('2FA', errorData.message);
    return;
  }

  // on success
  return (await qrCodeResponse.text());
}

/** --------------------------------------
 * 서버에 OTP 토큰을 전송
 * ---------------------------------------*/
export async function activate2FA_SubmitOtpTokenToServer(handleError: handleErrorFunction, token: string) {
  // 서버에 OTP 제출
  const requestUrl = `${API_URL}/user/me/2fa`;
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
    const errorData = await submitResponse.json();
    handleError('2FA', errorData.message);
    return ; // null on error
  }
  // on success
  return submitResponse;
}

/** --------------------------------------
 * 2차 인증 끄기
 * ---------------------------------------*/
export async function deactivate2FA_SubmitOtpTokenToServer(handleError: handleErrorFunction, token: string) {
  // 서버 qr 요청
  const requestUrl = `${API_URL}/user/me/2fa`;
  const requestPayload = {
    token: token
  }

  const submitResponse = await fetch(requestUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  // on error
  if (!submitResponse.ok) {
    const errorData = await submitResponse.json();
    handleError('2FA', errorData.message);
    return ; // null on error
  }
  // on success
  return submitResponse;
}
