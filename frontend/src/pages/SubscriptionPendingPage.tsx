import { useQuery } from "@tanstack/react-query";
import { Button, Paper, Typography } from "@mui/material";

import { subscriptionService } from "../services/subscriptionService";
import { useAuthStore } from "../store/authStore";

export function SubscriptionPendingPage() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const { data, isLoading } = useQuery({
    queryKey: ["current-subscription"],
    queryFn: subscriptionService.getCurrentSubscription,
  });

  return (
    <main className="page-centered">
      <Paper className="subscription-card" sx={{ p: 4, maxWidth: 520, mx: "auto", mt: 8, textAlign: "center" }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Payment pending
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your salon account has been created, but the subscription payment is still pending. Please complete
          payment to activate your account and access the dashboard.
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
              Monthly price: {data?.monthlyPrice != null ? `₹${data.monthlyPrice}` : "Contact support"}
            </Typography>
          </>
        )}

        <Typography color="warning.main" sx={{ mb: 3 }}>
          Status: {data?.subscriptionStatus || "PENDING_PAYMENT"}
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
