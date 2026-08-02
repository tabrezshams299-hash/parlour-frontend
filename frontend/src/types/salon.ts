import type { AccountStatus, SubscriptionStatus } from "./auth";

export interface Subscription {
  salonId: string;
  salonName: string;
  planName: string;
  monthlyPrice: number;
  startDate: string | null;
  expiryDate: string | null;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  accountStatus: AccountStatus;
}

export interface SalonAdminItem {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerMobile: string;
  phone: string;
  registeredAt: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiryDate: string | null;
  accountStatus: AccountStatus;
}

export interface UpdateSubscriptionRequest {
  planName?: string;
  monthlyPrice?: number;
  startDate?: string | null;
  expiryDate?: string | null;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
}

export interface ResetOwnerPasswordRequest {
  newPassword?: string;
}

export interface ResetOwnerPasswordResponse {
  newPassword: string;
}
