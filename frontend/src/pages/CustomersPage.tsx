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
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { customerService } from "../services/customerService";
import { getApiErrorMessage } from "../utils/apiError";
import type { CustomerGender } from "../types/customer";
import { useAuthStore } from "../store/authStore";

const customerSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters."),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits."),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  notes: z.string().max(500, "Notes must be 500 characters or fewer.").optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

type EditorMode = "create" | "edit";

interface EditorState {
  open: boolean;
  mode: EditorMode;
  customerId?: string;
}

const initialEditorState: EditorState = {
  open: false,
  mode: "create",
};

const genderOptions: Array<{ label: string; value: CustomerGender }> = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

export function CustomersPage() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentUser = useAuthStore((state) => state.user);
  const canDeleteCustomers = currentUser?.role === "OWNER";
  const [editor, setEditor] = useState<EditorState>(initialEditorState);
  const [pageError, setPageError] = useState<string | null>(null);

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: customerService.list,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      mobile: "",
      gender: "FEMALE",
      notes: "",
    },
  });

  const selectedGender = watch("gender");

  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditor(initialEditorState);
      reset();
    },
    onError: (error) => {
      setPageError(
        getApiErrorMessage(error, "Unable to create customer.", {
          conflictMessage: "Customer mobile already exists in this salon.",
        })
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerFormValues }) => {
      return customerService.update(id, {
        name: payload.name,
        mobile: payload.mobile,
        gender: payload.gender,
        notes: payload.notes || "",
      });
    },
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditor(initialEditorState);
      reset();
    },
    onError: (error) => {
      setPageError(
        getApiErrorMessage(error, "Unable to update customer.", {
          notFoundMessage: "Customer not found in this salon.",
          conflictMessage: "Customer mobile already exists in this salon.",
        })
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.remove,
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      setPageError(
        getApiErrorMessage(error, "Unable to delete customer.", {
          notFoundMessage: "Customer not found in this salon.",
        })
      );
    },
  });

  const editLoaderMutation = useMutation({
    mutationFn: customerService.getById,
    onSuccess: (customer) => {
      reset({
        name: customer.name,
        mobile: customer.mobile,
        gender: customer.gender,
        notes: customer.notes || "",
      });
      setEditor({
        open: true,
        mode: "edit",
        customerId: customer.id,
      });
    },
    onError: (error) => {
      setPageError(
        getApiErrorMessage(error, "Unable to load customer details.", {
          notFoundMessage: "Customer not found in this salon.",
        })
      );
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (editor.mode === "edit" && editor.customerId) {
      updateMutation.mutate({ id: editor.customerId, payload: values });
      return;
    }

    createMutation.mutate({
      name: values.name,
      mobile: values.mobile,
      gender: values.gender,
      notes: values.notes || "",
    });
  });

  const customers = useMemo(() => customersQuery.data ?? [], [customersQuery.data]);

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
            <Typography className="auth-kicker">Module 5</Typography>
            <Typography variant="h4" sx={{ marginTop: 1 }}>
              Customer Management
            </Typography>
            <Typography sx={{ marginTop: 0.5, color: "var(--muted)" }}>
              Manage customer profiles used by appointment and payment workflows.
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
                <Button component={Link} to="/owner/appointments" variant="outlined">
                  Appointments
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
                <Button component={Link} to="/reception/appointments" variant="outlined">
                  Appointments
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
                  name: "",
                  mobile: "",
                  gender: "FEMALE",
                  notes: "",
                });
                setEditor({ open: true, mode: "create" });
              }}
            >
              Add customer
            </Button>
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

        {customersQuery.isLoading ? (
          <Box sx={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box className="table-scroll">
            <Table sx={{ marginTop: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                  <TableCell>{customer.gender}</TableCell>
                  <TableCell>{customer.notes || "-"}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setPageError(null);
                          editLoaderMutation.mutate(customer.id);
                        }}
                      >
                        Edit
                      </Button>
                      {canDeleteCustomers ? (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Delete customer ${customer.name}? This action cannot be undone.`
                            );
                            if (confirmed) {
                              setPageError(null);
                              deleteMutation.mutate(customer.id);
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

              {!customers.length ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No customers found.
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
        <DialogTitle>{editor.mode === "create" ? "Create customer" : "Update customer"}</DialogTitle>
        <DialogContent>
          <Box sx={{ marginTop: 1, display: "grid", gap: 2 }}>
            <TextField
              label="Customer Name"
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

            <FormControl fullWidth>
              <InputLabel id="customer-gender-select-label">Gender</InputLabel>
              <Select
                labelId="customer-gender-select-label"
                label="Gender"
                value={selectedGender}
                onChange={(event) => {
                  setValue("gender", event.target.value as CustomerGender);
                }}
              >
                {genderOptions.map((gender) => (
                  <MenuItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              multiline
              minRows={3}
              error={Boolean(errors.notes)}
              helperText={errors.notes?.message || "Optional notes"}
              {...register("notes")}
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
