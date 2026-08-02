import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore, type AuthUser } from "../store/authStore";

const INACTIVE_ALLOWED_PATHS = ["/subscription-pending", "/subscription-expired", "/account-suspended", "/admin"];

function resolveBlockedPath(user: AuthUser): string {
  if (user.accountStatus === "SUSPENDED") return "/account-suspended";
  if (user.subscriptionStatus === "PENDING_PAYMENT") return "/subscription-pending";
  if (user.subscriptionStatus === "EXPIRED" || user.subscriptionStatus === "CANCELLED")
    return "/subscription-expired";
  return "/subscription-pending";
}

export function ProtectedRoute() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const canAccessDashboard = useAuthStore((state) => state.canAccessDashboard);

  if (!user || !accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessDashboard() && !INACTIVE_ALLOWED_PATHS.some((path) => location.pathname.startsWith(path))) {
    return <Navigate to={resolveBlockedPath(user)} replace />;
  }

  return <Outlet />;
}
