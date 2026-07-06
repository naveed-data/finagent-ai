import axios from "axios";
import { clearSession, getToken } from "./authStorage";

export const SESSION_EXPIRED_EVENT = "finagent:session-expired";

const api = axios.create({
  baseURL: "http://127.0.0.1:8002/api/v1",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && getToken()) {
      clearSession();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

export default api;
