
import { useNavigate } from "react-router";
import { Assert } from "@/utils/Assert";
import { useContext } from "react";
import GlobalContext from "@/context/GlobalContext";

export class ResponseError extends Error {
    public errorStatus: ResponseErrorType;

    constructor(errorStatus: ResponseErrorType, message: string) {
        super(message);
        this.errorStatus = errorStatus;
    }
}

export enum ResponseErrorType {
    TYPE_UNDEFINED,
    WRONG_API_CALL,
    ABNORMAL_SESSION,
    USER_ALREADY_LOGGED_IN,
}

function validateResponseStatus(response: Response) {
    if (response.ok) {
        return ; // do nothing
    } else if (response.status === 400) {
      throw new ResponseError(ResponseErrorType.WRONG_API_CALL, "[Front]: API 요청 형식 오류. URL을 확인하세요.");
    } else if (response.status === 401) { // 세션 비정상
      throw new ResponseError(ResponseErrorType.ABNORMAL_SESSION, "[Front]: 세션 오류입니다. 다시 로그인해주세요.");
    } else if (response.status === 409) {
      throw new ResponseError(ResponseErrorType.USER_ALREADY_LOGGED_IN, "[Front]: 이미 접속된 유저입니다.");
    } else {
      throw new ResponseError(ResponseErrorType.TYPE_UNDEFINED, "[Front]: 40x 기타 오류");
    }
}

export async function fetchAndHandleResponseError(url: string, requestObject?: RequestInit) {
  const navigate = useNavigate();
  const { loggedUserId, setLoggedUserId } = useContext(GlobalContext);

  try 
  {
    // ...
    const response = await fetch(url, requestObject);
    validateResponseStatus(response); // 여기서 status code throw.
    return (response);
  } 
  catch (err: unknown) 
  {
    if (err instanceof ResponseError) {
      switch(err.errorStatus) {
        case ResponseErrorType.TYPE_UNDEFINED:
          // 이 경우엔 Error Page 를 띄워주자.
          break;
        case ResponseErrorType.WRONG_API_CALL:
          // 이건 프론트에서 잘못된 것임으로 Assert를 띄워주자.
          // ... 이건 백엔드와 규정이 되지 않은 error code. 
          break;
        case ResponseErrorType.ABNORMAL_SESSION:
          // ... alert 때리고 로그인으로 이동, state 초기화
          sessionStorage.clear();
          setLoggedUserId(null);
          navigate("/login");
          break; 
        case ResponseErrorType.USER_ALREADY_LOGGED_IN:
          // ... alert 때리고 로그인 페이지로 이동, state 초기화
          sessionStorage.clear();
          setLoggedUserId(null);
          navigate("/login");
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