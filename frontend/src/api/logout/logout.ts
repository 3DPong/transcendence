import { API_URL } from '../../../config/backend';
import { handleErrorFunction } from '@/context/ErrorContext';

export async function requestLogOut(handleError: handleErrorFunction) {
  const requestUrl = `${API_URL}/auth/logout`;
  const signUpResponse = await fetch(requestUrl, { method: 'GET' });

  // on error
  if (!signUpResponse.ok) {
    const errorData = await signUpResponse.json();
    handleError('LogOut', errorData.message);
    return;
  }
}
