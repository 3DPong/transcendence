
import {Assert} from '@/utils/Assert';

const API_HOST = process.env.REACT_APP_EXTERNAL_HOST;
const API_PORT = process.env.REACT_APP_EXTERNAL_PORT;
Assert.NonNullish(API_HOST, "env variable REACT_APP_EXTERNAL_HOST not set");
Assert.NonNullish(API_PORT, "env variable REACT_APP_EXTERNAL_PORT not set");

export const API_URL = `http://${API_HOST}:${API_PORT}/api`;
export const ORIGIN_URL = `http://${API_HOST}:${API_PORT}`;
export const SOCKET_URL = `http://${API_HOST}:${API_PORT}`;