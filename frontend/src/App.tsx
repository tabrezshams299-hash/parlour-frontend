import { useEffect, useState } from "react";

import { AppRouter } from "./routes/AppRouter";
import { MobileQuickNav } from "./components/MobileQuickNav";
import { authService } from "./services/authService";
import { useAuthStore } from "./store/authStore";

function App() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      if (!refreshToken || accessToken) {
        if (isMounted) {
          setBootstrapping(false);
        }
        return;
      }

      try {
        const response = await authService.refresh(refreshToken);
        if (isMounted) {
          setSession(response);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearSession, refreshToken, setSession]);

  if (bootstrapping) {
    return (
      <main className="loading-screen">
        <div className="loading-dot" />
        <p>Verifying your session...</p>
      </main>
    );
  }

  return (
    <>
      <AppRouter />
      <MobileQuickNav />
    </>
  );
}

export default App;
