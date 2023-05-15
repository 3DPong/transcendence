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
  const requestUrl = `${API_URL}/signin/email`;
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
  const verifyCode: EmailVerifyCodeResponsePayload = await signUpResponse.json();
  return verifyCode;
}

// -------------------------------------------------------

interface verifyEmailRequestPayload {
  email: string,
  clientCode: string, // 클라이언트가 친 인증코드
  verifyCode: string,
}

export async function verifyEmail(
  handleAlert: handleAlertFunction,
  email_address: string,
  clientCode: string,
  verifyCode: string
) {
  const requestUrl = `${API_URL}/emailVerify`;
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

  // on error
  if (!signUpResponse.ok) {
      const errorData = await signUpResponse.json();
      handleAlert('Email Verification', errorData.message);
      return;
  } else { // on success
      handleAlert('Email Verify', 'Success', null, 'success');
  }
}

