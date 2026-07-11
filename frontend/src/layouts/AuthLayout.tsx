import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <p className="auth-kicker">Luxury Salon Suite</p>
        <h1>Elevate every client moment with elegant salon operations.</h1>
        <p>
          Sign in to orchestrate bookings, customer care, billing, and staff performance from
          one premium control center.
        </p>
      </section>
      <section className="auth-form-panel">{children}</section>
    </main>
  );
}
