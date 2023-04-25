import {handleErrorFunction} from "@/context/ErrorContext";
import {API_URL} from "../../../config/backend";


export interface History {
  user_id: number;
  target_id: number;
  user_score: number;
  target_score: number;
  user_nickname: string;
  target_nickname: string;
}
// response
export interface GET_UserHistoryResponseFormat {
  history: History[];
}

export async function getUserHistoryById(handleError: handleErrorFunction, userId: number) {
  const requestUrl = `${API_URL}/user/${userId}/history`;
  const userHistoryResponse = await fetch(requestUrl, { method: "GET" });

  // on error
  if (!userHistoryResponse.ok) {
    const errorData = await userHistoryResponse.json();
    handleError(
        "UserData",
        errorData.message,
        errorData.status === 401 ? '/login' : null,
    ); // redirect to /login page
    return ;
  }
  // on success
  const userHistory: GET_UserHistoryResponseFormat = await userHistoryResponse.json();
  return userHistory.history;
}