import { handleAlertFunction } from '@/context/AlertContext';
import { API_URL, ORIGIN_URL } from '../../../config/backend';

interface EmailVerifyCodeRequestPayload {
  email: string
}

interface EmailVerifyCodeResponsePayload {
  verifyCode: string
}

export async function sendEmailVerifyCode(
  handleAlert: handleAlertFunction,
  email_address: string
) {
  const requestUrl = `${API_URL}/auth/signin/email`;
  const requestPayload: EmailVerifyCodeRequestPayload = {
    email: email_address
  };
  const signUpResponse = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  // on error
  if (!signUpResponse.ok) {
    if (signUpResponse.status === 401) {
      const errorData = await signUpResponse.json();
      handleAlert('Email Verification', errorData.message, '../');
      return;
    } else {
      const errorData = await signUpResponse.json();
      handleAlert('Email Verification', errorData.message);
      return;
    }
  }
  const responsePayload: EmailVerifyCodeResponsePayload = await signUpResponse.json();
  return responsePayload.verifyCode;
}

// -------------------------------------------------------

interface verifyEmailRequestPayload {
  email: string,
  clientCode: string, // 클라이언트가 친 인증코드
  verifyCode: string,
}

interface verifyEmailResponsePayload {
  redirectURL: string, // 프론트에서 이 경로로 리다이렉트 시켜줄 것.
}

/**
 * @param handleAlert status에 따라 alert하기 위한 핸들러 함수
 * @param email_address 이메일 주소
 * @param clientCode 사용자가 입력한 인증 코드
 * @param verifyCode sendEmailVerifyCode()에서 반환해준 이메일 인증용 암호 토큰
 * @returns 리다이렉트 코드
 */
export async function verifyEmail(
  handleAlert: handleAlertFunction,
  email_address: string,
  clientCode: string,
  verifyCode: string
) {
  const requestUrl = `${API_URL}/auth/emailVerify`;
  const requestPayload: verifyEmailRequestPayload = {
    email: email_address,
    clientCode: clientCode,
    verifyCode: verifyCode,
  };

  const signUpResponse = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  const responsePayload: verifyEmailResponsePayload = await signUpResponse.json();

  // on error
  if (!signUpResponse.ok) {
      handleAlert('Email Verify', 'Failure', null, 'error');
  } else { // on success
      handleAlert('Email Verify', 'Success', null, 'success');
  }
  return (responsePayload.redirectURL);
}

