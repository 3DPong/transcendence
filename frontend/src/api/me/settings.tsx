
/**
 * 세션을 바탕으로 나에 대한 정보를 요청할 수 있는 API 입니다.
 * @link https://github.com/3DPong/transcendence/issues/69
 */
import { API_URL } from "../config"
import { fetchAndHandleSessionError } from "../status/session";

// return.
// user_id, profile_src, 
interface GET_responseFormat {
    user_id: number;
    nickname: string;
    profile_url: string;
    two_factor: boolean;
}

// GET /api/user/me
export async function getMySettings() {
    const requestUri = `${API_URL}/user/me/settings`;
    const response = await fetchAndHandleSessionError(requestUri, { method: "GET" });

    if (response) {
        const responseData: GET_responseFormat = await response.json();
        return responseData;
    } else {
        return null;
    }
}