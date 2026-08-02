import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authStorage } from "../utils/storage";
import type { AccountStatus, AuthResponse, SubscriptionStatus, UserRole } from "../types/auth";

export interface AuthUser {
  userId: string;
  salonId: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  accountStatus: AccountStatus;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser | null;
  setSession: (payload: AuthResponse) => void;
  clearSession: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  canAccessDashboard: () => boolean;
}

const initialState = {
  accessToken: null,
  refreshToken: null,
  tokenType: "Bearer",
  expiresInSeconds: 0,
  user: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setSession: (payload) => {
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          tokenType: payload.tokenType,
          expiresInSeconds: payload.expiresInSeconds,
          user: {
            userId: payload.userId,
            salonId: payload.salonId,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            subscriptionStatus: payload.subscriptionStatus,
            accountStatus: payload.accountStatus,
          },
        });
      },
      clearSession: () => {
        set({ ...initialState });
      },
      hasRole: (allowedRoles) => {
        const role = get().user?.role;
        return role ? allowedRoles.includes(role) : false;
      },
      canAccessDashboard: () => {
        const user = get().user;
        if (!user) return false;
        if (user.role === "SUPER_ADMIN") return true;
        return user.subscriptionStatus === "ACTIVE" && user.accountStatus === "ACTIVE";
      },
    }),
    {
      name: authStorage.key,
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        tokenType: state.tokenType,
        expiresInSeconds: state.expiresInSeconds,
        user: state.user,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
