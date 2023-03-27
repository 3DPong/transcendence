
import { useNavigate } from "react-router";
import { Assert } from "@/utils/Assert";
import { useContext } from "react";
import GlobalContext from "@/context/GlobalContext";

/**
 * fetch의 response status가 2FactorAuth와 관련된 경우입니다.
 * @link https://github.com/3DPong/transcendence/pull/63
 * ----------------------------------------------------------------------------
 * [ 1. activate ]
 * 200 : 활성화 완료, 결과로 QR 코드 이미지를 전달받습니다.
 * 401(invalid user (session is not valid)) : 세션 문제
 * 400(already activated) : 이미 활성화된 유저의 요청 거부
 * 500 : 내부 서버 문제
 * 
 * [ 2. deactivate ]
 * 200 : 비활성화 완료
 * 401(invalid user (session is not valid)) : 세션 문제
 * 400(user 2fa is not activated): 이미 비활성화된 유저의 요청 거부
 * 400(token is invalid) : 토큰이 유효하지 않음
 * 500 : 내부 서버 문제
 * 
 * [ 3. 사용작가 입력한 2FA OTP 코드 전송결과 ]
 * 200, true -> 토큰이 유효하며 인증에 성공했습니다. 로그인된 세션으로 전환됐습니다.
 * 200, false -> 잘못된 토큰을 전달받았습니다. 재인증을 요구합니다.
 * 400(bad token input) -> 토큰의 형식 자체가 잘못된 경우입니다.
 */


class AuthError extends Error {
    public errorStatus: AuthErrorType;

    constructor(errorStatus: AuthErrorType, message: string) {
        super(message);
        this.errorStatus = errorStatus;
    }
}

enum AuthErrorType {
    TYPE_UNDEFINED,
    InvalidUser, // 401 세션문제
    AuthNotActivated_Or_InvalidToken, // 400 이미 비활성화된 유저의 요청 거부 // 400 토큰이 유호하지 않음.
    ServerError, // 500 서버 내부 문제
}

// activate
function validateAuthDeactivateResponseStatus(response: Response) {
    if (response.ok) {
        console.log("[DEV] 비활성화 완료");
        return ; // do nothing
    } else if (response.status === 400) {
      throw new AuthError(AuthErrorType.AuthNotActivated_Or_InvalidToken, response.statusText);
    } else if (response.status === 401) { // 세션 비정상
      throw new AuthError(AuthErrorType.InvalidUser, "[DEV] 세션 오류입니다. 다시 로그인해주세요.");
    } else {
      throw new AuthError(AuthErrorType.TYPE_UNDEFINED, response.statusText);
    }
}

// 세션검증에 대한 Response처리 입니다.
// 로그인 이후 사용자 정보, 리스트 등을 요청할 때 발생하는 error status code는 세션 관련 정보들입니다.
// response가 성공일 경우 response 객체를 반환하고, 그게 아니면 null을 반환합니다.
export async function fetchAndHandleAuthDeactivateError(url: string, requestObject?: RequestInit) {
  // const navigate = useNavigate();
  // const { loggedUserId, setLoggedUserId } = useContext(GlobalContext);
  try 
  {
    // ...
    const response = await fetch(url, requestObject);
    validateAuthDeactivateResponseStatus(response); // 여기서 status code throw.
    return (response);
  } 
  catch (err: unknown) 
  {
    if (err instanceof AuthError) {
      switch(err.errorStatus) {
        case AuthErrorType.TYPE_UNDEFINED:
          //...
          break;
        case AuthErrorType.InvalidUser: // 401
          //...
          break; 
        case AuthErrorType.AuthNotActivated_Or_InvalidToken: // 400
          //...
          break; 
        default:
          // ... 여기는 말이 안됨. Assert 넣기.
          Assert.MustBeTrue(false, "처리되지 않은 case");
      }
    } else { // 알 수 없는 에러는 다시 던지기
      throw err;
    }
    return (null);
  }
}