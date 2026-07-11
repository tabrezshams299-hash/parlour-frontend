import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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

import { userService } from "../../services/userService";
import { getApiErrorMessage } from "../../utils/apiError";
import type { UserRole } from "../../types/auth";
import { useAuthStore } from "../../store/authStore";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits."),
  email: z.email("Please enter a valid email address."),
  password: z
    .string()
    .max(128, "Password is too long.")
    .optional()
    .or(z.literal("")),
  role: z.enum(["OWNER", "RECEPTION", "STAFF"]),
  active: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

type EditorMode = "create" | "edit";

interface EditorState {
  open: boolean;
  mode: EditorMode;
  userId?: string;
}

const initialEditorState: EditorState = {
  open: false,
  mode: "create",
};

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: "Owner", value: "OWNER" },
  { label: "Reception", value: "RECEPTION" },
  { label: "Staff", value: "STAFF" },
];

function maskEmail(value: string): string {
  const [localPart, domainPart] = value.split("@");
  if (!localPart || !domainPart) {
    return value;
  }

  const maskedLocal = `${localPart.slice(0, 1)}***`;
  const [domainName, ...domainSuffixParts] = domainPart.split(".");
  const maskedDomain = `${domainName.slice(0, 1)}***${domainSuffixParts.length ? `.${domainSuffixParts.join(".")}` : ""}`;
  return `${maskedLocal}@${maskedDomain}`;
}

function maskMobile(value: string): string {
  if (value.length <= 4) {
    return value;
  }

  return `${value.slice(0, 2)}******${value.slice(-2)}`;
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentUser = useAuthStore((state) => state.user);
  const canCreateUsers = currentUser?.role === "OWNER";
  const [editor, setEditor] = useState<EditorState>(initialEditorState);
  const [pageError, setPageError] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: userService.list,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      password: "",
      role: "RECEPTION",
      active: true,
    },
  });

  const selectedRole = watch("role");
  const isActive = watch("active");

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditor(initialEditorState);
      reset();
    },
    onError: (error) => {
      setPageError(getApiErrorMessage(error, "Unable to create user."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserFormValues }) => {
      const updatePayload = {
        name: payload.name,
        mobile: payload.mobile,
        email: payload.email,
        role: payload.role,
        active: payload.active,
        ...(payload.password ? { password: payload.password } : {}),
      };

      return userService.update(id, updatePayload);
    },
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditor(initialEditorState);
      reset();
    },
    onError: (error) => {
      setPageError(getApiErrorMessage(error, "Unable to update user."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.remove,
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      setPageError(getApiErrorMessage(error, "Unable to delete user."));
    },
  });

  const editLoaderMutation = useMutation({
    mutationFn: userService.getById,
    onSuccess: (user) => {
      reset({
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        password: "",
        role: user.role,
        active: user.active,
      });
      setEditor({
        open: true,
        mode: "edit",
        userId: user.id,
      });
    },
    onError: (error) => {
      setPageError(getApiErrorMessage(error, "Unable to load user details."));
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (editor.mode === "edit" && editor.userId) {
      updateMutation.mutate({ id: editor.userId, payload: values });
      return;
    }

    if (!canCreateUsers) {
      setPageError("Only OWNER can create users.");
      return;
    }

    if (!values.password || values.password.length < 8) {
      setPageError("Password must be at least 8 characters when creating a user.");
      return;
    }

    createMutation.mutate({
      name: values.name,
      mobile: values.mobile,
      email: values.email,
      password: values.password,
      role: values.role,
      active: values.active,
    });
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const canManageUsers = currentUser?.role === "OWNER";

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
            <Typography className="auth-kicker">Module 2</Typography>
            <Typography variant="h4" sx={{ marginTop: 1 }}>
              User Management
            </Typography>
            <Typography sx={{ marginTop: 0.5, color: "var(--muted)" }}>
              View and manage salon users for operational coordination.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              component={Link}
              to={currentUser?.role === "OWNER" ? "/owner/customers" : "/reception/customers"}
              variant="outlined"
            >
              Customers
            </Button>
            <Button
              component={Link}
              to={currentUser?.role === "OWNER" ? "/owner/appointments" : "/reception/appointments"}
              variant="outlined"
            >
              Appointments
            </Button>
            {currentUser?.role === "OWNER" ? (
              <Button component={Link} to="/owner/services" variant="outlined">
                Services
              </Button>
            ) : null}
            {currentUser?.role === "OWNER" ? (
              <Button component={Link} to="/owner/staff-earnings" variant="outlined">
                Staff Earnings
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
            {canCreateUsers ? (
              <Button
                variant="contained"
                onClick={() => {
                  setPageError(null);
                  reset({
                    name: "",
                    mobile: "",
                    email: "",
                    password: "",
                    role: "RECEPTION",
                    active: true,
                  });
                  setEditor({ open: true, mode: "create" });
                }}
              >
                Add user
              </Button>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ marginTop: 2 }}>
          {currentUser ? (
            <Chip
              label={`Logged in as ${currentUser.email} (${currentUser.role})`}
              color="primary"
              variant="outlined"
            />
          ) : null}
        </Box>

        {pageError ? (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {pageError}
          </Alert>
        ) : null}

        {usersQuery.isLoading ? (
          <Box sx={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box className="table-scroll">
            <Table sx={{ marginTop: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role === "OWNER" ? maskEmail(user.email) : user.email}</TableCell>
                  <TableCell>{user.role === "OWNER" ? maskMobile(user.mobile) : user.mobile}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={user.active ? "success" : "default"}
                      label={user.active ? "Active" : "Inactive"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {canManageUsers ? (
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setPageError(null);
                            editLoaderMutation.mutate(user.id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Delete user ${user.email}? This action cannot be undone.`
                            );
                            if (confirmed) {
                              setPageError(null);
                              deleteMutation.mutate(user.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    ) : (
                      <Chip size="small" label="View only" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {!users.length ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found.
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
        <DialogTitle>{editor.mode === "create" ? "Create user" : "Update user"}</DialogTitle>
        <DialogContent>
          <Box sx={{ marginTop: 1, display: "grid", gap: 2 }}>
            <TextField
              label="Name"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Mobile"
              error={Boolean(errors.mobile)}
              helperText={errors.mobile?.message}
              {...register("mobile")}
            />
            <TextField
              label="Email"
              type="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label={editor.mode === "create" ? "Password" : "Password (optional)"}
              type="password"
              error={Boolean(errors.password)}
              helperText={
                errors.password?.message ||
                (editor.mode === "edit"
                  ? "Leave blank to keep current password."
                  : "Must be at least 8 characters.")
              }
              {...register("password")}
            />

            <FormControl fullWidth>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                label="Role"
                value={selectedRole}
                onChange={(event) => {
                  setValue("role", event.target.value as UserRole);
                }}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(event) => {
                    setValue("active", event.target.checked);
                  }}
                />
              }
              label="Active user"
            />
          </Box>
        </DialogContent>
        <DialogActions>
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
            disabled={createMutation.isPending || updateMutation.isPending || editLoaderMutation.isPending}
          >
            {editor.mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
