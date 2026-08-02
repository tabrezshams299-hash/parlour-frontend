import { useQuery } from "@tanstack/react-query";
import { Button, Paper, Typography } from "@mui/material";

import { subscriptionService } from "../services/subscriptionService";
import { useAuthStore } from "../store/authStore";

export function SubscriptionExpiredPage() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const { data, isLoading } = useQuery({
    queryKey: ["current-subscription"],
    queryFn: subscriptionService.getCurrentSubscription,
  });

  return (
    <main className="page-centered">
      <Paper className="subscription-card" sx={{ p: 4, maxWidth: 520, mx: "auto", mt: 8, textAlign: "center" }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Subscription inactive
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your salon subscription is not active. Please renew your subscription or contact the SaaS admin to
          continue using the dashboard.
        </Typography>

        {isLoading ? (
          <Typography>Loading subscription details...</Typography>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Salon: {data?.salonName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Plan: {data?.planName || "STARTER"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Expired on: {data?.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : "N/A"}
            </Typography>
          </>
        )}

        <Typography color="error" sx={{ mb: 3 }}>
          Status: {data?.subscriptionStatus || "EXPIRED"}
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
