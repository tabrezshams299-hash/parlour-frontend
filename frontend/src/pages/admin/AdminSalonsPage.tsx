import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { adminService } from "../../services/adminService";
import { useAuthStore } from "../../store/authStore";
import type { SalonAdminItem, UpdateSubscriptionRequest } from "../../types/salon";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "N/A";
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "ACTIVE" ? "success.main" : status === "PENDING_PAYMENT" ? "warning.main" : "error.main";
  return (
    <Typography component="span" sx={{ color, fontWeight: 600 }}>
      {status}
    </Typography>
  );
}

export function AdminSalonsPage() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedSalon, setSelectedSalon] = useState<SalonAdminItem | null>(null);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordResult, setPasswordResult] = useState<string | null>(null);

  const [subscriptionForm, setSubscriptionForm] = useState<UpdateSubscriptionRequest>({
    planName: "",
    monthlyPrice: 0,
    startDate: null,
    expiryDate: null,
    subscriptionStatus: "ACTIVE",
    paymentStatus: "PAID",
  });

  const { data: salons = [], isLoading } = useQuery({
    queryKey: ["admin-salons", appliedSearch],
    queryFn: () => adminService.getSalons(appliedSearch || undefined),
  });

  const activateMutation = useMutation({
    mutationFn: adminService.activateSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-salons"] }),
  });

  const suspendMutation = useMutation({
    mutationFn: adminService.suspendSalon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-salons"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteSalon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-salons"] }),
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubscriptionRequest }) =>
      adminService.updateSubscription(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-salons"] });
      setSubscriptionDialogOpen(false);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: import("../../types/salon").ResetOwnerPasswordRequest }) =>
      adminService.resetOwnerPassword(id, payload || {}),
    onSuccess: (data) => {
      setPasswordResult(data.newPassword);
      queryClient.invalidateQueries({ queryKey: ["admin-salons"] });
    },
  });

  const handleSearch = () => setAppliedSearch(search.trim());

  const openSubscription = (salon: SalonAdminItem) => {
    setSelectedSalon(salon);
    setSubscriptionForm({
      planName: "",
      monthlyPrice: 0,
      startDate: null,
      expiryDate: null,
      subscriptionStatus: salon.subscriptionStatus,
      paymentStatus: "PAID",
    });
    setSubscriptionDialogOpen(true);
  };

  const submitSubscription = () => {
    if (!selectedSalon) return;
    updateSubscriptionMutation.mutate({ id: selectedSalon.id, payload: subscriptionForm });
  };

  const handleResetPassword = (salon: SalonAdminItem) => {
    setSelectedSalon(salon);
    setPasswordResult(null);
    setPasswordDialogOpen(true);
    resetPasswordMutation.mutate({ id: salon.id });
  };

  return (
    <main className="page-shell">
      <Box sx={{ p: 3 }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
          <Typography component="h1" variant="h4" gutterBottom>
            SaaS Admin — Salons
          </Typography>
          <Button variant="outlined" color="error" onClick={clearSession}>
            Logout
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Search salons"
            placeholder="Name, owner email, mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            fullWidth
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="outlined" onClick={() => { setSearch(""); setAppliedSearch(""); }}>
            Clear
          </Button>
        </Stack>

        {isLoading ? (
          <Typography>Loading salons...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Salon</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>Subscription</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salons.map((salon) => (
                  <TableRow key={salon.id}>
                    <TableCell>{salon.name}</TableCell>
                    <TableCell>{salon.ownerName}</TableCell>
                    <TableCell>
                      {salon.ownerEmail}
                      <br />
                      {salon.ownerMobile}
                    </TableCell>
                    <TableCell>{formatDate(salon.registeredAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={salon.subscriptionStatus} />
                      <br />
                      Exp: {formatDate(salon.subscriptionExpiryDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={salon.accountStatus} />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Button size="small" onClick={() => openSubscription(salon)}>
                        View
                      </Button>
                      <Button size="small" color="success" onClick={() => activateMutation.mutate(salon.id)}>
                        Activate
                      </Button>
                      <Button size="small" color="warning" onClick={() => suspendMutation.mutate(salon.id)}>
                        Suspend
                      </Button>
                      <Button size="small" color="error" onClick={() => deleteMutation.mutate(salon.id)}>
                        Delete
                      </Button>
                      <Button size="small" color="info" onClick={() => handleResetPassword(salon)}>
                        Reset pwd
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {salons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No salons found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={subscriptionDialogOpen} onClose={() => setSubscriptionDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Subscription for {selectedSalon?.name}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Plan name"
                value={subscriptionForm.planName}
                onChange={(e) => setSubscriptionForm((f) => ({ ...f, planName: e.target.value }))}
              />
              <TextField
                label="Monthly price"
                type="number"
                value={subscriptionForm.monthlyPrice}
                onChange={(e) => setSubscriptionForm((f) => ({ ...f, monthlyPrice: Number(e.target.value) }))}
              />
              <TextField
                label="Start date"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={subscriptionForm.startDate || ""}
                onChange={(e) => setSubscriptionForm((f) => ({ ...f, startDate: e.target.value || null }))}
              />
              <TextField
                label="Expiry date"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={subscriptionForm.expiryDate || ""}
                onChange={(e) => setSubscriptionForm((f) => ({ ...f, expiryDate: e.target.value || null }))}
              />
              <TextField
                select
                label="Subscription status"
                value={subscriptionForm.subscriptionStatus}
                onChange={(e) =>
                  setSubscriptionForm((f) => ({ ...f, subscriptionStatus: e.target.value as UpdateSubscriptionRequest["subscriptionStatus"] }))
                }
                slotProps={{ select: { native: true } }}
              >
                <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CANCELLED">CANCELLED</option>
              </TextField>
              <TextField
                select
                label="Payment status"
                value={subscriptionForm.paymentStatus}
                onChange={(e) =>
                  setSubscriptionForm((f) => ({ ...f, paymentStatus: e.target.value as UpdateSubscriptionRequest["paymentStatus"] }))
                }
                slotProps={{ select: { native: true } }}
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubscriptionDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={submitSubscription} disabled={updateSubscriptionMutation.isPending}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Owner password reset</DialogTitle>
          <DialogContent>
            {passwordResult ? (
              <Alert severity="info" sx={{ mt: 1 }}>
                New password for {selectedSalon?.ownerEmail}: <strong>{passwordResult}</strong>
              </Alert>
            ) : (
              <Typography sx={{ mt: 1 }}>Generating new password...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </main>
  );
}
