import { API_URL } from '../../../config/backend';

export interface GET_SignInResponseFormat {
  status: 'SUCCESS' /*로그인성공 */ | 'SIGNUP_MODE' /*회원가입*/ | '2FA' /*2차인증(QR코드 받기)*/;
  user_id?: number; // SUCCESS일 경우에만 날라옴.
}

export async function requestSignIn() {
  // 이 부분은 성준님 코드를 기반으로 작성할 예정.
  // location.href = `${API_URL}/auth/signin/42`;

  // 이제 서버에서 보내준 상태 처리
  const mock: GET_SignInResponseFormat = {
    status: 'SUCCESS',
    user_id: 42,
  };
  return mock;
}
