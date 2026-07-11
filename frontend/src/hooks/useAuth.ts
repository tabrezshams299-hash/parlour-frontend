import { useMemo } from "react";

import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types/auth";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMemo(
    () => ({
      isAuthenticated: Boolean(user && accessToken),
      user,
      logout: clearSession,
      hasRole: (roles: UserRole[]) => {
        if (!user?.role) {
          return false;
        }

        return roles.includes(user.role);
      },
    }),
    [accessToken, clearSession, user]
  );
}
