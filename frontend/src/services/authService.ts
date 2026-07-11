import { httpClient } from "./http";
import type { AuthResponse, LoginRequest } from "../types/auth";

export const authService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await httpClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await httpClient.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    return data;
  },
};
