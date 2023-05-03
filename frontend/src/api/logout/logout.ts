import { API_URL } from '../../../config/backend';
import { handleAlertFunction } from '@/context/AlertContext';

export async function requestLogOut(handleAlert: handleAlertFunction) {
  const requestUrl = `${API_URL}/auth/signout`;
  const signUpResponse = await fetch(requestUrl, { method: 'GET' });

  // on error
  if (!signUpResponse.ok) {
    const errorData = await signUpResponse.json();
    handleAlert('Signout', errorData.message);
    return;
  }
  return signUpResponse;
}
