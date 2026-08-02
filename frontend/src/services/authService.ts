import { httpClient } from "./http";
import type {
  AuthResponse,
  LoginRequest,
  SalonRegistrationRequest,
  SalonRegistrationResponse,
} from "../types/auth";

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
  register: async (payload: SalonRegistrationRequest): Promise<SalonRegistrationResponse> => {
    const { data } = await httpClient.post<SalonRegistrationResponse>("/auth/register", payload);
    return data;
  },
};
