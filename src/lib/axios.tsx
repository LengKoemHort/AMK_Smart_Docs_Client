import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
} from "./token-store";
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API = axios.create({ baseURL: API_BASE_URL });

// Refresh queue state
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Interceptor
API.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let token = getAccessToken();

  if (token && isTokenExpired()) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await axios.post(`${API_BASE_URL}/api/refresh/`, {
          refresh_token: getRefreshToken(),
        });

        const { access_token, refresh_token, expires } = refreshRes.data.body;

        setTokens({
          access: access_token,
          refresh: refresh_token,
          expires,
        });

        token = access_token;
        processQueue(null, access_token);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        isRefreshing = false;
        return Promise.reject(err);
      }
      isRefreshing = false;
    } else {
      // Wait until refresh is done
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (value?: unknown) => {
            const newToken = value as string;
            if (config.headers)
              config.headers.Authorization = `Bearer ${newToken}`;
            resolve(config);
          },
          reject,
        });
      });
    }
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//  Response Interceptor
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // fallback for 401 if expired token slipped
    if (error.response?.status === 401) {
      clearTokens();
    }
    return Promise.reject(error);
  }
);

export default API;
