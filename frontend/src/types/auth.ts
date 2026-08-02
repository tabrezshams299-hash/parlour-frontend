export type UserRole = "OWNER" | "RECEPTION" | "STAFF" | "SUPER_ADMIN";

export type SubscriptionStatus = "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

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
  subscriptionStatus: SubscriptionStatus;
  accountStatus: AccountStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SalonRegistrationRequest {
  salonName: string;
  ownerName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

export interface SalonRegistrationResponse {
  salonId: string;
  ownerId: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  accountStatus: AccountStatus;
  message: string;
}

export interface ApiErrorShape {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
