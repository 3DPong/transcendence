import { API_URL } from '../../../config/backend';
import { handleErrorFunction } from '@/context/ErrorContext';

export async function requestLogOut(handleError: handleErrorFunction) {
  const requestUrl = `${API_URL}/auth/signout`;
  const signUpResponse = await fetch(requestUrl, { method: 'GET' });

  // on error
  if (!signUpResponse.ok) {
    const errorData = await signUpResponse.json();
    handleError('Signout', errorData.message);
    return;
  }
  return signUpResponse;
}
