import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { appointmentService } from "../services/appointmentService";
import { customerService } from "../services/customerService";
import { serviceService } from "../services/serviceService";
import { staffService } from "../services/staffService";
import { userService } from "../services/userService";
import { useAuthStore } from "../store/authStore";
import type { AppointmentPaymentMode, AppointmentStatus } from "../types/appointment";
import { getApiErrorMessage } from "../utils/apiError";

function parseTimeToMinutes(value: string): number {
  const [hour, minute] = value.split(":").map((part) => Number.parseInt(part, 10));
  return hour * 60 + minute;
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function currentTimeRoundedToMinutes(stepMinutes = 5): string {
  const now = new Date();
  const minutes = now.getMinutes();
  const rounded = Math.ceil(minutes / stepMinutes) * stepMinutes;
  now.setMinutes(rounded, 0, 0);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function addMinutes(time: string, minutesToAdd: number): string {
  const [hour, minute] = time.split(":").map((part) => Number.parseInt(part, 10));
  const base = hour * 60 + minute + minutesToAdd;
  const wrapped = ((base % 1440) + 1440) % 1440;
  const nextHour = Math.floor(wrapped / 60);
  const nextMinute = wrapped % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

function resolveDisplayPaymentMode(value: AppointmentPaymentMode | null): string {
  return value ?? "N/A";
}

const appointmentSchema = z
  .object({
    customerId: z.string().uuid("Select a valid customer."),
    serviceId: z.string().uuid("Select a valid service."),
    staffId: z.string().uuid("Select a valid staff member."),
    appointmentDate: z.string().min(1, "Appointment date is required."),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time is required."),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time is required."),
    durationMinutes: z
      .number({ error: "Duration is required." })
      .min(5, "Duration must be at least 5 minutes.")
      .max(600, "Duration is too high."),
    totalAmount: z
      .number({ error: "Amount is required." })
      .min(0.01, "Amount must be greater than zero.")
      .max(1_000_000, "Amount is too high."),
    paymentMode: z.enum(["CASH", "UPI", "CARD"]),
    paid: z.boolean(),
    status: z.enum(["BOOKED", "COMPLETED", "CANCELLED"]),
  })
  .refine((value) => parseTimeToMinutes(value.endTime) > parseTimeToMinutes(value.startTime), {
    message: "End time must be after start time.",
    path: ["endTime"],
  })
  .refine((value) => value.status !== "COMPLETED" || value.paid, {
    message: "Appointment must be paid before marking as completed.",
    path: ["paid"],
  });

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

type EditorMode = "create" | "edit";

interface EditorState {
  open: boolean;
  mode: EditorMode;
  appointmentId?: string;
}

const initialEditorState: EditorState = {
  open: false,
  mode: "create",
};

const statusOptions: Array<{ label: string; value: AppointmentStatus }> = [
  { label: "Booked", value: "BOOKED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const paymentModeOptions: Array<{ label: string; value: AppointmentPaymentMode }> = [
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Card", value: "CARD" },
];

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentUser = useAuthStore((state) => state.user);
  const defaultDate = formatDateInput(new Date());
  const defaultStartTime = currentTimeRoundedToMinutes();
  const canDeleteAppointments = currentUser?.role === "OWNER";
  const [editor, setEditor] = useState<EditorState>(initialEditorState);
  const [pageError, setPageError] = useState<string | null>(null);
  const [customerMobileInput, setCustomerMobileInput] = useState("");

  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentService.list,
  });

  const customersQuery = useQuery({
    queryKey: ["customer-options"],
    queryFn: customerService.list,
  });

  const usersQuery = useQuery({
    queryKey: ["user-options"],
    queryFn: userService.list,
  });

  const servicesQuery = useQuery({
    queryKey: ["service-options"],
    queryFn: serviceService.list,
  });

  const staffQuery = useQuery({
    queryKey: ["staff-options"],
    queryFn: staffService.listOptions,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerId: "",
      serviceId: "",
      staffId: "",
      appointmentDate: defaultDate,
      startTime: defaultStartTime,
      endTime: addMinutes(defaultStartTime, 45),
      durationMinutes: 45,
      totalAmount: 0,
      paymentMode: "UPI",
      paid: false,
      status: "BOOKED",
    },
  });

  const selectedCustomerId = watch("customerId");
  const selectedServiceId = watch("serviceId");
  const selectedStaffId = watch("staffId");
  const selectedPaymentMode = watch("paymentMode");
  const selectedAmount = watch("totalAmount");
  const selectedDurationMinutes = watch("durationMinutes");
  const selectedStartTime = watch("startTime");
  const isPaid = watch("paid");
  const selectedStatus = watch("status");

  const createMutation = useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setEditor(initialEditorState);
      reset();
    },
    onError: (error) => {
      setPageError(
        getApiErrorMessage(error, "Unable to create appointment.", {
          badRequestMessage: "Invalid time range or staff selection.",
          notFoundMessage: "Selected customer, service, or staff was not found.",
          conflictMessage: "Selected staff already has an overlapping appointment.",
        })
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AppointmentFormValues }) => {
      return appointmentService.update(id, {
        customerId: payload.customerId,
        serviceId: payload.serviceId,
        staffId: payload.staffId,
        appointmentDate: payload.appointmentDate,
        startTime: normalizeTime(payload.startTime),
        endTime: normalizeTime(payload.endTime),
        totalAmount: payload.totalAmount,
        paymentMode: payload.paymentMode,
        paid: payload.paid,
        status: payload.status,
      });
    },
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setEditor(initialEditorState);
      reset();
    },
    onError: (error) => {
      setPageError(
        getApiErrorMessage(error, "Unable to update appointment.", {
          badRequestMessage: "Invalid time range or staff selection.",
          notFoundMessage: "Selected customer, service, staff, or appointment was not found.",
          conflictMessage: "Selected staff already has an overlapping appointment.",
        })
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: appointmentService.remove,
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      setPageError(
        getApiErrorMessage(error, "Unable to delete appointment.", {
          notFoundMessage: "Appointment not found in this salon.",
        })
      );
    },
  });

  const editLoaderMutation = useMutation({
    mutationFn: appointmentService.getById,
    onSuccess: (appointment) => {
      reset({
        customerId: appointment.customerId,
        serviceId: appointment.serviceId,
        staffId: appointment.staffId,
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime.slice(0, 5),
        endTime: appointment.endTime.slice(0, 5),
        durationMinutes: Math.max(
          5,
          parseTimeToMinutes(appointment.endTime.slice(0, 5)) -
            parseTimeToMinutes(appointment.startTime.slice(0, 5))
        ),
        totalAmount: appointment.totalAmount,
        paymentMode: appointment.paymentMode ?? "UPI",
        paid: appointment.paid,
        status: appointment.status,
      });
      setEditor({
        open: true,
        mode: "edit",
        appointmentId: appointment.id,
      });
    },
    onError: (error) => {
      setPageError(
        getApiErrorMessage(error, "Unable to load appointment details.", {
          notFoundMessage: "Appointment not found in this salon.",
        })
      );
    },
  });

  const onSubmit = handleSubmit((values) => {
    const payload = {
      customerId: values.customerId,
      serviceId: values.serviceId,
      staffId: values.staffId,
      appointmentDate: values.appointmentDate,
      startTime: normalizeTime(values.startTime),
      endTime: normalizeTime(values.endTime),
      totalAmount: values.totalAmount,
      paymentMode: values.paymentMode,
      paid: values.paid,
      status: values.status,
    };

    if (editor.mode === "edit" && editor.appointmentId) {
      updateMutation.mutate({ id: editor.appointmentId, payload: values });
      return;
    }

    createMutation.mutate(payload);
  });

  const appointments = useMemo(() => appointmentsQuery.data ?? [], [appointmentsQuery.data]);
  const customers = useMemo(() => customersQuery.data ?? [], [customersQuery.data]);
  const fallbackStaff = useMemo(
    () =>
      (usersQuery.data ?? [])
        .filter((user) => user.role === "STAFF" && user.active)
        .map((user) => ({ id: user.id, name: user.name })),
    [usersQuery.data]
  );
  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const staff = useMemo(
    () => (staffQuery.data?.length ? staffQuery.data : fallbackStaff),
    [fallbackStaff, staffQuery.data]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );
  const matchedCustomerByMobile = useMemo(
    () => customers.find((customer) => customer.mobile === customerMobileInput) ?? null,
    [customerMobileInput, customers]
  );
  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId, services]
  );

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerMobileInput(selectedCustomer.mobile);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (matchedCustomerByMobile) {
      setValue("customerId", matchedCustomerByMobile.id, { shouldValidate: true });
    }
  }, [matchedCustomerByMobile, setValue]);

  useEffect(() => {
    if (!selectedService) {
      return;
    }
    setValue("durationMinutes", selectedService.durationMinutes, { shouldValidate: true });
    setValue("totalAmount", selectedService.price, { shouldValidate: true });
  }, [selectedService, setValue]);

  useEffect(() => {
    if (!selectedStartTime || !selectedDurationMinutes) {
      return;
    }

    setValue("endTime", addMinutes(selectedStartTime, selectedDurationMinutes), {
      shouldValidate: true,
    });
  }, [selectedDurationMinutes, selectedStartTime, setValue]);

  return (
    <main className="role-home">
      <Paper className="role-home-card" elevation={0}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography className="auth-kicker">Module 6</Typography>
            <Typography variant="h4" sx={{ marginTop: 1 }}>
              Appointment Management
            </Typography>
            <Typography sx={{ marginTop: 0.5, color: "var(--muted)" }}>
              Schedule appointments and capture payment details from one unified flow.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {currentUser?.role === "OWNER" ? (
              <>
                <Button component={Link} to="/owner/users" variant="outlined">
                  Users
                </Button>
                <Button component={Link} to="/owner/services" variant="outlined">
                  Services
                </Button>
                <Button component={Link} to="/owner/customers" variant="outlined">
                  Customers
                </Button>
                <Button component={Link} to="/owner/staff-earnings" variant="outlined">
                  Staff Earnings
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/reception/users" variant="outlined">
                  Users
                </Button>
                <Button component={Link} to="/reception/customers" variant="outlined">
                  Customers
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              onClick={() => {
                clearSession();
              }}
            >
              Sign out
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setPageError(null);
                reset({
                  customerId: "",
                  serviceId: "",
                  staffId: "",
                  appointmentDate: defaultDate,
                  startTime: defaultStartTime,
                  endTime: addMinutes(defaultStartTime, 45),
                  durationMinutes: 45,
                  totalAmount: 0,
                  paymentMode: "UPI",
                  paid: false,
                  status: "BOOKED",
                });
                setCustomerMobileInput("");
                setEditor({ open: true, mode: "create" });
              }}
              disabled={!customers.length || !services.length || !staff.length}
            >
              Add appointment
            </Button>
          </Box>
        </Box>

        <Box sx={{ marginTop: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {currentUser ? (
            <Chip
              label={`Logged in as ${currentUser.email} (${currentUser.role})`}
              color="primary"
              variant="outlined"
            />
          ) : null}
          {!customers.length ? <Chip label="No customers" color="warning" variant="outlined" /> : null}
          {!services.length ? <Chip label="No services" color="warning" variant="outlined" /> : null}
          {!staffQuery.data?.length && fallbackStaff.length ? (
            <Chip label="Using fallback staff" color="warning" variant="outlined" />
          ) : null}
          {!staff.length ? <Chip label="No staff" color="warning" variant="outlined" /> : null}
        </Box>

        {servicesQuery.isError ? (
          <Alert severity="warning" sx={{ marginTop: 2 }}>
            Service catalog is unavailable. Reception booking depends on backend services created by OWNER.
          </Alert>
        ) : null}

        {staffQuery.isError && fallbackStaff.length ? (
          <Alert severity="warning" sx={{ marginTop: 1 }}>
            Staff list is temporarily unavailable. Active staff users are being used as a fallback so reception can still create bookings.
          </Alert>
        ) : null}

        {pageError ? (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {pageError}
          </Alert>
        ) : null}

        {appointmentsQuery.isLoading ? (
          <Box sx={{ marginTop: 3, display: "grid", gap: 1.2 }}>
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
          </Box>
        ) : (
          <Box className="table-scroll">
            <Table sx={{ marginTop: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.appointmentDate}</TableCell>
                  <TableCell>
                    {appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}
                  </TableCell>
                  <TableCell>{appointment.customerName}</TableCell>
                  <TableCell>{appointment.serviceName}</TableCell>
                  <TableCell>{appointment.staffName}</TableCell>
                  <TableCell>{appointment.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={appointment.paid ? "success" : "warning"}
                      label={`${resolveDisplayPaymentMode(appointment.paymentMode)} - ${appointment.paid ? "Paid" : "Unpaid"}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={appointment.status}
                      color={
                        appointment.status === "COMPLETED"
                          ? "success"
                          : appointment.status === "CANCELLED"
                            ? "error"
                            : "primary"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setPageError(null);
                          editLoaderMutation.mutate(appointment.id);
                        }}
                      >
                        Edit
                      </Button>
                      {canDeleteAppointments ? (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Delete appointment for ${appointment.customerName} on ${appointment.appointmentDate}?`
                            );
                            if (confirmed) {
                              setPageError(null);
                              deleteMutation.mutate(appointment.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {!appointments.length ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      <Dialog
        open={editor.open}
        fullWidth
        maxWidth="sm"
        onClose={() => {
          setEditor(initialEditorState);
        }}
      >
        <DialogTitle>{editor.mode === "create" ? "Create appointment" : "Update appointment"}</DialogTitle>
        <DialogContent>
          <Box sx={{ marginTop: 1, display: "grid", gap: 2 }}>
            <FormControl fullWidth error={Boolean(errors.customerId)}>
              <InputLabel id="appointment-customer-select-label">Customer</InputLabel>
              <Select
                labelId="appointment-customer-select-label"
                label="Customer"
                value={selectedCustomerId}
                onChange={(event) => {
                  setValue("customerId", event.target.value);
                }}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.mobile})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Customer Phone"
              value={customerMobileInput}
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, "").slice(0, 10);
                setCustomerMobileInput(next);
                if (!next) {
                  setValue("customerId", "", { shouldValidate: true });
                  return;
                }

                const match = customers.find((customer) => customer.mobile === next);
                if (!match) {
                  setValue("customerId", "", { shouldValidate: true });
                }
              }}
              slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 } }}
              helperText={
                matchedCustomerByMobile
                  ? `Matched: ${matchedCustomerByMobile.name} (${matchedCustomerByMobile.mobile})`
                  : "Enter phone to auto-select customer"
              }
            />

            <FormControl fullWidth error={Boolean(errors.serviceId)}>
              <InputLabel id="appointment-service-select-label">Service</InputLabel>
              <Select
                labelId="appointment-service-select-label"
                label="Service"
                value={selectedServiceId}
                onChange={(event) => {
                  setValue("serviceId", event.target.value);
                }}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name} ({service.durationMinutes}m)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth error={Boolean(errors.staffId)}>
              <InputLabel id="appointment-staff-select-label">Staff</InputLabel>
              <Select
                labelId="appointment-staff-select-label"
                label="Staff"
                value={selectedStaffId}
                onChange={(event) => {
                  setValue("staffId", event.target.value);
                }}
              >
                {staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.id}>
                    {staffMember.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Appointment Date"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(errors.appointmentDate)}
              helperText={errors.appointmentDate?.message}
              {...register("appointmentDate")}
            />
            <TextField
              label="Start Time"
              type="time"
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(errors.startTime)}
              helperText={errors.startTime?.message}
              {...register("startTime")}
            />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {[5, 10, 20].map((mins) => (
                <Button
                  key={mins}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const base = selectedStartTime || currentTimeRoundedToMinutes();
                    setValue("startTime", addMinutes(base, mins), { shouldValidate: true });
                  }}
                >
                  +{mins} min
                </Button>
              ))}
            </Box>
            <TextField
              label="Duration (minutes)"
              type="number"
              slotProps={{ htmlInput: { min: 5, max: 600, step: 5 }, inputLabel: { shrink: true } }}
              error={Boolean(errors.durationMinutes)}
              helperText={errors.durationMinutes?.message}
              {...register("durationMinutes", {
                setValueAs: (value) => Number.parseInt(value, 10),
              })}
            />
            <TextField
              label="End Time"
              type="time"
              slotProps={{ htmlInput: { readOnly: true }, inputLabel: { shrink: true } }}
              error={Boolean(errors.endTime)}
              helperText={errors.endTime?.message || "Auto-calculated from start time and duration"}
              {...register("endTime")}
            />

            <TextField
              label="Total Amount"
              type="number"
              value={Number.isFinite(selectedAmount) ? selectedAmount : 0}
              slotProps={{
                htmlInput: { step: "0.01", min: 0, readOnly: true },
                inputLabel: { shrink: true },
              }}
              error={Boolean(errors.totalAmount)}
              helperText={errors.totalAmount?.message || "Auto-populated from selected service"}
            />

            <FormControl fullWidth>
              <InputLabel id="appointment-payment-mode-select-label">Payment Mode</InputLabel>
              <Select
                labelId="appointment-payment-mode-select-label"
                label="Payment Mode"
                value={selectedPaymentMode}
                onChange={(event) => {
                  setValue("paymentMode", event.target.value as AppointmentPaymentMode);
                }}
              >
                {paymentModeOptions.map((paymentMode) => (
                  <MenuItem key={paymentMode.value} value={paymentMode.value}>
                    {paymentMode.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={isPaid}
                  onChange={(event) => {
                    setValue("paid", event.target.checked);
                  }}
                />
              }
              label="Payment received"
            />
            {errors.paid?.message ? (
              <Typography variant="caption" sx={{ color: "var(--error)", marginTop: -1 }}>
                {errors.paid.message}
              </Typography>
            ) : null}

            <FormControl fullWidth>
              <InputLabel id="appointment-status-select-label">Status</InputLabel>
              <Select
                labelId="appointment-status-select-label"
                label="Status"
                value={selectedStatus}
                onChange={(event) => {
                  setValue("status", event.target.value as AppointmentStatus);
                }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            position: "sticky",
            bottom: 0,
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderTop: "1px solid var(--outline-variant)",
          }}
        >
          <Button
            onClick={() => {
              setEditor(initialEditorState);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              void onSubmit();
            }}
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              editLoaderMutation.isPending ||
              !customers.length ||
              !services.length ||
              !staff.length
            }
          >
            {editor.mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
