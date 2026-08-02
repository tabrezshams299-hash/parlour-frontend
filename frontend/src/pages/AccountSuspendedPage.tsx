import { Button, Paper, Typography } from "@mui/material";

import { useAuthStore } from "../store/authStore";

export function AccountSuspendedPage() {
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <main className="page-centered">
      <Paper className="subscription-card" sx={{ p: 4, maxWidth: 520, mx: "auto", mt: 8, textAlign: "center" }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Account suspended
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your salon account has been suspended. Please contact the SaaS administrator for assistance.
        </Typography>

        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mr: 1 }}>
          Refresh status
        </Button>
        <Button variant="outlined" onClick={clearSession}>
          Sign out
        </Button>
      </Paper>
    </main>
  );
}
