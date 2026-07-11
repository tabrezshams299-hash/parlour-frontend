import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import { useAuthStore } from "../store/authStore";
import { staffService } from "../services/staffService";
import { staffEarningsService } from "../services/staffEarningsService";
import { getApiErrorMessage } from "../utils/apiError";

type EarningsPeriod = "daily" | "weekly" | "monthly";

function getMonday(dateIso: string): string {
  const date = dayjs(dateIso);
  const day = date.day();
  const diff = day === 0 ? -6 : 1 - day;
  return date.add(diff, "day").format("YYYY-MM-DD");
}

export function StaffEarningsPage() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentUser = useAuthStore((state) => state.user);

  const todayIso = dayjs().format("YYYY-MM-DD");
  const [period, setPeriod] = useState<EarningsPeriod>("daily");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedWeekStartDate, setSelectedWeekStartDate] = useState<string>(getMonday(todayIso));
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);

  const isStaff = currentUser?.role === "STAFF";

  const staffOptionsQuery = useQuery({
    queryKey: ["staff-earnings-staff-options", currentUser?.role],
    queryFn: staffService.listOptions,
    enabled: Boolean(currentUser) && !isStaff,
  });

  const effectiveStaffId = isStaff ? currentUser?.userId ?? "" : selectedStaffId;

  const earningsQuery = useQuery({
    queryKey: [
      "staff-earnings",
      period,
      effectiveStaffId,
      selectedDate,
      selectedWeekStartDate,
      selectedYear,
      selectedMonth,
    ],
    enabled: Boolean(effectiveStaffId),
    queryFn: async () => {
      if (period === "daily") {
        return staffEarningsService.daily(effectiveStaffId, selectedDate);
      }

      if (period === "weekly") {
        return staffEarningsService.weekly(effectiveStaffId, selectedWeekStartDate);
      }

      return staffEarningsService.monthly(effectiveStaffId, selectedYear, selectedMonth);
    },
  });

  const staffOptions = useMemo(() => staffOptionsQuery.data ?? [], [staffOptionsQuery.data]);
  const records = useMemo(() => earningsQuery.data?.records ?? [], [earningsQuery.data?.records]);

  useEffect(() => {
    if (isStaff) {
      return;
    }

    if (!staffOptions.length) {
      if (selectedStaffId) {
        setSelectedStaffId("");
      }
      return;
    }

    const exists = staffOptions.some((item) => item.id === selectedStaffId);
    if (!selectedStaffId || !exists) {
      setSelectedStaffId(staffOptions[0].id);
    }
  }, [isStaff, selectedStaffId, staffOptions]);

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
            <Typography className="auth-kicker">Module 8</Typography>
            <Typography variant="h4" sx={{ marginTop: 1 }}>
              Staff Earnings
            </Typography>
            <Typography sx={{ marginTop: 0.5, color: "var(--muted)" }}>
              View staff commission earnings across daily, weekly, and monthly periods.
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
                <Button component={Link} to="/owner/appointments" variant="outlined">
                  Appointments
                </Button>
              </>
            ) : null}

            {currentUser?.role === "STAFF" ? (
              <Button component={Link} to="/staff/earnings" variant="outlined">
                Refresh
              </Button>
            ) : null}

            <Button
              variant="outlined"
              onClick={() => {
                clearSession();
              }}
            >
              Sign out
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
          {earningsQuery.data ? (
            <Chip
              label={`Period ${earningsQuery.data.periodStart} to ${earningsQuery.data.periodEnd}`}
              variant="outlined"
            />
          ) : null}
        </Box>

        <Box sx={{ marginTop: 3, display: "grid", gap: 2 }}>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, next) => {
              if (next) {
                setPeriod(next as EarningsPeriod);
              }
            }}
            size="small"
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {!isStaff ? (
              <FormControl fullWidth>
                <InputLabel id="staff-earnings-staff-select-label">Staff</InputLabel>
                <Select
                  labelId="staff-earnings-staff-select-label"
                  label="Staff"
                  value={selectedStaffId}
                  onChange={(event) => {
                    setSelectedStaffId(event.target.value);
                  }}
                >
                  {staffOptions.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Staff"
                value={currentUser?.name ?? ""}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
            )}

            {period === "daily" ? (
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={selectedDate}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                }}
              />
            ) : null}

            {period === "weekly" ? (
              <TextField
                label="Week Start Date"
                type="date"
                fullWidth
                value={selectedWeekStartDate}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) => {
                  setSelectedWeekStartDate(event.target.value);
                }}
              />
            ) : null}

            {period === "monthly" ? (
              <>
                <TextField
                  label="Year"
                  type="number"
                  fullWidth
                  value={selectedYear}
                  onChange={(event) => {
                    setSelectedYear(Number(event.target.value));
                  }}
                />
                <TextField
                  label="Month"
                  type="number"
                  fullWidth
                  value={selectedMonth}
                  slotProps={{ htmlInput: { min: 1, max: 12 } }}
                  onChange={(event) => {
                    setSelectedMonth(Number(event.target.value));
                  }}
                />
              </>
            ) : null}
          </Box>
        </Box>

        {!isStaff && staffOptionsQuery.isError ? (
          <Alert severity="warning" sx={{ marginTop: 2 }}>
            {getApiErrorMessage(staffOptionsQuery.error, "Unable to load staff options.")}
          </Alert>
        ) : null}

        {!isStaff && !staffOptionsQuery.isLoading && !staffOptions.length ? (
          <Alert severity="info" sx={{ marginTop: 2 }}>
            No active staff available. Create or activate a staff user to view earnings.
          </Alert>
        ) : null}

        {earningsQuery.isError ? (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {getApiErrorMessage(earningsQuery.error, "Unable to load staff earnings.", {
              notFoundMessage: "Staff or appointment data not found for earnings generation.",
            })}
          </Alert>
        ) : null}

        {earningsQuery.isLoading ? (
          <Box sx={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!earningsQuery.isLoading && earningsQuery.data ? (
          <>
            <Box sx={{ marginTop: 3, display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <Paper variant="outlined" sx={{ padding: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Completed Appointments
                </Typography>
                <Typography variant="h5">{earningsQuery.data.appointmentsCount}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ padding: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Service Amount
                </Typography>
                <Typography variant="h5">{earningsQuery.data.totalServiceAmount.toFixed(2)}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ padding: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Commission Amount
                </Typography>
                <Typography variant="h5">{earningsQuery.data.totalCommissionAmount.toFixed(2)}</Typography>
              </Paper>
            </Box>

            <Box className="table-scroll">
              <Table sx={{ marginTop: 3 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Earning Date</TableCell>
                  <TableCell>Service Amount</TableCell>
                  <TableCell>Commission Type</TableCell>
                  <TableCell>Commission Value</TableCell>
                  <TableCell>Commission Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.serviceName}</TableCell>
                    <TableCell>{record.earningDate}</TableCell>
                    <TableCell>{record.serviceAmount.toFixed(2)}</TableCell>
                    <TableCell>{record.commissionType}</TableCell>
                    <TableCell>{record.commissionValue.toFixed(2)}</TableCell>
                    <TableCell>{record.commissionAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}

                {!records.length ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No earnings records found for this period.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
              </Table>
            </Box>
          </>
        ) : null}
      </Paper>
    </main>
  );
}
