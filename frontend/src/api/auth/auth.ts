
/** --------------------------------------
 * 이 파일은 2차 인증에 관련된 api 요청입니다.
 * 2FA Auth 관련 API 
 * @link https://github.com/3DPong/transcendence/pull/70
 * ---------------------------------------*/


import { fetchAndHandleAuthActivateError } from "../status/authActivate";
import { fetchAndHandleAuthDeactivateError } from "../status/authDeactivate";

// 1. activate 2fa
export interface PUT_activate2FactorAuthRequestFormat {}
// 따로 request 없음.
export interface PUT_activate2FactorAuthResponseFormat {}
// response : 201 QR 코드.
// 그냥 body로 qr 이미지 넘어올 예정. 
type QrCodeURL = string;

const DUMMY_QR_URL = "https://user-images.githubusercontent.com/81505228/227768069-ce703fd5-6707-4509-89c3-5d1c7a7b47ba.png";


// PUT /user/2fa/activate.
// 이 qr을 찍고, 암호 생성후 입력해야만 키는걸 ok 시킴.
export async function activate2FactorAuthAndGetQrCode() {
  return new Promise<QrCodeURL>(async (resolve, reject) => {

    // 서버 qr 요청
    const PUT_URL = `/user/2fa/activate`;
    const response = await fetchAndHandleAuthActivateError(PUT_URL, { method: "PUT" });
    if (response) {
      const QR_URL = response.text();
      console.log(`response from server: ${QR_URL}`);
      resolve(QR_URL);
    }
    setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      resolve(DUMMY_QR_URL);
    }, 1000);
  });
}


// https://github.com/3DPong/transcendence/pull/63
// 이거를 바탕으로 response status에 따른 handle이 필요함...



// 2. 서버로 otp토큰 전송
export interface POST_submit2FactorAuthTokenRequestFormat {}
// 그냥 body에 입력값 담아서 보낼 것. 
export interface POST_submit2FactorAuthTokenResponseFormat {}
// 따로 들어오는 데이터 없음

// POST /auth/2fa/otp
// 사용자가 입력한 코드를 서버로 전송
// 200, true -> 토큰이 유효하며 인증에 성공했습니다. 로그인된 세션으로 전환됐습니다.
// 200, false -> 잘못된 토큰을 전달받았습니다. 재인증을 요구합니다.
// 400(bad token input) -> 토큰의 형식 자체가 잘못된 경우입니다.
export async function submitOtpTokenToServer(token: string) {
    // 서버에 OTP 제출j
    const POST_URL = `/auth/2fa/otp`;
   // 3. 서버에 Request 전송
    // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch
    await fetchAndHandleAuthDeactivateError(POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: token
    });
}





// 2. deactivate 2fa
// PUT /user/2fa/deactivate.
// 200 : 비활성화 완료
// 401(invalid user (session is not valid)) : 세션 문제
// 400(user 2fa is not activated): 이미 비활성화된 유저의 요청 거부
// 400(token is invalid) : 토큰이 유효하지 않음
// 500 : 내부 서버 문제
export interface PUT_deactivate2FactorAuthRequestFormat {}
// 없음.
export interface PUT_deactivate2FactorAuthResponseFormat {}
// 없음.

export async function deactivate2FactorAuth() {
  return new Promise<QrCodeURL>(async (resolve, reject) => {

    // 서버 qr 요청
    const PUT_URL = `/user/2fa/deactivate`;
    await fetchAndHandleAuthDeactivateError(PUT_URL, { method: "PUT" });
    setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      resolve(DUMMY_QR_URL);
    }, 1000);
  });
}