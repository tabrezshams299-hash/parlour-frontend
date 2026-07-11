import { Navigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

interface RoleHomePageProps {
  role: "OWNER" | "RECEPTION" | "STAFF";
}

export function RoleHomePage({ role }: RoleHomePageProps) {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="role-home">
      <section className="role-home-card">
        <p className="auth-kicker">Authenticated Session</p>
        <h1>Welcome, {user.name}</h1>
        <p>
          You are signed in as <strong>{role}</strong>. Module 1 authentication and role security are
          active.
        </p>

        <div className="profile-grid">
          <div>
            <span>Name</span>
            <p>{user.name}</p>
          </div>
          <div>
            <span>Email</span>
            <p>{user.email}</p>
          </div>
          <div>
            <span>Role</span>
            <p>{user.role}</p>
          </div>
          <div>
            <span>Salon ID</span>
            <p>{user.salonId}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            clearSession();
          }}
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
