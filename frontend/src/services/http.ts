import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import type { AuthResponse } from "../types/auth";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://localhost:9090/api";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

httpClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken && config.headers && !config.url?.includes("/auth/login")) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (!request || status !== 401 || request._retry) {
      return Promise.reject(error);
    }

    if (request.url?.includes("/auth/login") || request.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    request._retry = true;

    const { refreshToken, setSession, clearSession } = useAuthStore.getState();

    if (!refreshToken) {
      clearSession();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      setSession(data);

      request.headers = request.headers ?? {};
      request.headers.Authorization = `Bearer ${data.accessToken}`;

      return httpClient(request);
    } catch (refreshError) {
      clearSession();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);
