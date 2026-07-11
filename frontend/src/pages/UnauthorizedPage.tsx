import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <main className="role-home">
      <section className="role-home-card">
        <p className="auth-kicker">Authorization</p>
        <h1>Access denied</h1>
        <p>Your account does not have permission to access this screen.</p>
        <Link className="inline-link" to="/login">
          Return to login
        </Link>
      </section>
    </main>
  );
}
