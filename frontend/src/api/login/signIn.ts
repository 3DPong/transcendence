import {API_URL} from '../../../config/backend';

/*
  By oauth protocol, you should open this page in new tab, where authorization window will be present
  (or if you already authorized see next), then upon authorization you will be redirected to
  callback url, which is https://dev.example.com/recent-comments that is set as &from= parameter.
  // Let me not to describe oauth protocol here. You may check how remark handle oauth here for example
*/

export async function request42SignIn() {
  location.href = `${API_URL}/auth/signin/42`;
}

export async function requestKakaoSignIn() {
  location.href = `${API_URL}/auth/signin/kakao`;
}

export async function requestNaverSignIn() {
  location.href = `${API_URL}/auth/signin/naver`;
}

export async function requestGoogleSignIn() {
  location.href = `${API_URL}/auth/signin/google`;
}


