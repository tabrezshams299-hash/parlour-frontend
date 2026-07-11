import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authStorage } from "../utils/storage";
import type { AuthResponse, UserRole } from "../types/auth";

interface AuthUser {
  userId: string;
  salonId: string;
  name: string;
  email: string;
  role: UserRole;
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
