import { Link, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

interface NavItem {
  label: string;
  to: string;
}

function buildNav(role: string | undefined): NavItem[] {
  if (role === "OWNER") {
    return [
      { label: "Users", to: "/owner/users" },
      { label: "Customers", to: "/owner/customers" },
      { label: "Appointments", to: "/owner/appointments" },
      { label: "Earnings", to: "/owner/staff-earnings" },
    ];
  }

  if (role === "RECEPTION") {
    return [
      { label: "Users", to: "/reception/users" },
      { label: "Customers", to: "/reception/customers" },
      { label: "Appointments", to: "/reception/appointments" },
    ];
  }

  if (role === "STAFF") {
    return [{ label: "Earnings", to: "/staff/earnings" }];
  }

  return [];
}

export function MobileQuickNav() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  if (location.pathname === "/login" || location.pathname === "/unauthorized") {
    return null;
  }

  const items = buildNav(user.role);
  if (!items.length) {
    return null;
  }

  return (
    <nav className="mobile-quick-nav" aria-label="Mobile quick navigation">
      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`mobile-quick-nav-item${active ? " active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
