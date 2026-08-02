import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterSalonPage } from "../pages/auth/RegisterSalonPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { SubscriptionPendingPage } from "../pages/SubscriptionPendingPage";
import { SubscriptionExpiredPage } from "../pages/SubscriptionExpiredPage";
import { AccountSuspendedPage } from "../pages/AccountSuspendedPage";
import { AdminSalonsPage } from "../pages/admin/AdminSalonsPage";
import { UsersPage } from "../pages/owner/UsersPage";
import { ServicesPage } from "../pages/owner/ServicesPage";
import { CustomersPage } from "../pages/CustomersPage";
import { AppointmentsPage } from "../pages/AppointmentsPage";
import { StaffEarningsPage } from "../pages/StaffEarningsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterSalonPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/subscription-pending" element={<SubscriptionPendingPage />} />
        <Route path="/subscription-expired" element={<SubscriptionExpiredPage />} />
        <Route path="/account-suspended" element={<AccountSuspendedPage />} />

        <Route element={<RoleRoute allowedRoles={["SUPER_ADMIN"]} />}>
          <Route path="/admin" element={<AdminSalonsPage />} />
          <Route path="/admin/salons" element={<AdminSalonsPage />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["OWNER"]} />}>
          <Route path="/owner" element={<Navigate to="/owner/users" replace />} />
          <Route path="/owner/users" element={<UsersPage />} />
          <Route path="/owner/services" element={<ServicesPage />} />
          <Route path="/owner/customers" element={<CustomersPage />} />
          <Route path="/owner/appointments" element={<AppointmentsPage />} />
          <Route path="/owner/staff-earnings" element={<StaffEarningsPage />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["RECEPTION"]} />}>
          <Route path="/reception" element={<Navigate to="/reception/customers" replace />} />
          <Route path="/reception/users" element={<UsersPage />} />
          <Route path="/reception/customers" element={<CustomersPage />} />
          <Route path="/reception/appointments" element={<AppointmentsPage />} />
          <Route path="/reception/staff-earnings" element={<Navigate to="/unauthorized" replace />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["STAFF"]} />}>
          <Route path="/staff" element={<Navigate to="/staff/earnings" replace />} />
          <Route path="/staff/earnings" element={<StaffEarningsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
