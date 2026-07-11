export type UserRole = "OWNER" | "RECEPTION" | "STAFF";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: string;
  salonId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiErrorShape {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
