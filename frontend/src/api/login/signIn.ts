
import {API_URL} from "../../../config/backend";

export interface GET_SignInResponseFormat {
  status:   "SUCCESS" /*로그인성공 */ 
          | "SIGNUP_MODE" /*회원가입*/ 
          | "2FA"; /*2차인증(QR코드 받기)*/
  user_id?: number; // SUCCESS일 경우에만 날라옴.
}

export async function requestSignIn() {
    const requestUri = `${API_URL}/api/auth/signin/42`;
    // 이 부분은 성준님 코드를 기반으로 작성할 예정.
};