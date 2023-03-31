

/**
 * fetch의 response status가 Session과 관련된 경우입니다.
 * @link https://github.com/orgs/3DPong/discussions/14#discussioncomment-5368509
 * ----------------------------------------------------------------------------
 * 400 Bad request : 대부분 dto. API call이 잘못된 거임.
 * 401은 무조건 세션비전상. 
 * 409는 로그인 후 다른 창에서 또 접속할 경우 --> 내가 "이미 접속된 유저입니다." 라고 띄워줘야함
 */


import { useNavigate } from "react-router";
import { Assert } from "@/utils/Assert";
import { useContext } from "react";
import GlobalContext from "@/context/GlobalContext";

class SessionError extends Error {
    public errorStatus: SessionErrorType;

    constructor(errorStatus: SessionErrorType, message: string) {
        super(message);
        this.errorStatus = errorStatus;
    }
}

enum SessionErrorType {
    TYPE_UNDEFINED,
    WRONG_API_CALL,
    InvalidUser,
    USER_ALREADY_LOGGED_IN,
}

function validateSessionResponseStatus(response: Response) {
    if (response.ok) {
        return ; // do nothing
    } else if (response.status === 400) {
      throw new SessionError(SessionErrorType.WRONG_API_CALL, "[DEV] API 요청 형식 오류. URL을 확인하세요.");
    } else if (response.status === 401) { // 세션 비정상
      throw new SessionError(SessionErrorType.InvalidUser, "[DEV] 세션 오류입니다. 다시 로그인해주세요.");
    } else if (response.status === 409) {
      throw new SessionError(SessionErrorType.USER_ALREADY_LOGGED_IN, "[DEV] 이미 접속된 유저입니다.");
    } else {
      throw new SessionError(SessionErrorType.TYPE_UNDEFINED, "[DEV] 40x 기타 오류");
    }
}

// 세션검증에 대한 Response처리 입니다.
// 로그인 이후 사용자 정보, 리스트 등을 요청할 때 발생하는 error status code는 세션 관련 정보들입니다.
// response가 성공일 경우 response 객체를 반환하고, 그게 아니면 null을 반환합니다.
export async function fetchAndHandleSessionError(url: string, requestObject?: RequestInit) {

  try 
  {
    // ...
    const response = await fetch(url, requestObject);
    validateSessionResponseStatus(response); // 여기서 status code throw.
    return (response);
  } 
  catch (err: unknown) 
  {
    if (err instanceof SessionError) {
      switch(err.errorStatus) {
        case SessionErrorType.TYPE_UNDEFINED:
          // 이 경우엔 Error Page 를 띄워주자.
          break;
        case SessionErrorType.WRONG_API_CALL:
          // 이건 프론트에서 잘못된 것임으로 Assert를 띄워주자.
          // ... 이건 백엔드와 규정이 되지 않은 error code. 
          break;
        case SessionErrorType.InvalidUser:
          // ... alert 때리고 로그인으로 이동, state 초기화
          // sessionStorage.clear();
          // setLoggedUserId(null);
          // navigate("/login");
          break; 
        case SessionErrorType.USER_ALREADY_LOGGED_IN:
          // ... alert 때리고 로그인 페이지로 이동, state 초기화
          // sessionStorage.clear();
          // setLoggedUserId(null);
          // navigate("/login");
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