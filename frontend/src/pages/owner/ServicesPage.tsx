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
  FormControlLabel,
  Paper,
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

import { serviceService } from "../../services/serviceService";
import { getApiErrorMessage } from "../../utils/apiError";
import { useAuthStore } from "../../store/authStore";

const serviceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters."),
  price: z
    .number({ error: "Price is required." })
    .min(0.01, "Price must be greater than 0.")
    .max(1_000_000, "Price is too high."),
  durationMinutes: z
    .number({ error: "Duration is required." })
    .int("Duration must be a whole number.")
    .min(5, "Duration must be at least 5 minutes.")
    .max(600, "Duration is too large."),
  active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

type EditorMode = "create" | "edit";

interface EditorState {
  open: boolean;
  mode: EditorMode;
  serviceId?: string;
}

const initialEditorState: EditorState = {
  open: false,
  mode: "create",
};

export function ServicesPage() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentUser = useAuthStore((state) => state.user);
  const [editor, setEditor] = useState<EditorState>(initialEditorState);
  const [pageError, setPageError] = useState<string | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: serviceService.list,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      price: 0,
      durationMinutes: 45,
      active: true,
    },
  });

  const isActive = watch("active");

  const createMutation = useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["services"] });
      setEditor(initialEditorState);
      reset();
    },
    onError: (error) => {
      setPageError(getApiErrorMessage(error, "Unable to create service."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ServiceFormValues }) => {
      return serviceService.update(id, {
        name: payload.name,
        price: payload.price,
        durationMinutes: payload.durationMinutes,
        active: payload.active,
      });
    },
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["services"] });
      setEditor(initialEditorState);
      reset();
    },
    onError: (error) => {
      setPageError(getApiErrorMessage(error, "Unable to update service."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: serviceService.remove,
    onSuccess: () => {
      setPageError(null);
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) => {
      setPageError(getApiErrorMessage(error, "Unable to delete service."));
    },
  });

  const editLoaderMutation = useMutation({
    mutationFn: serviceService.getById,
    onSuccess: (service) => {
      reset({
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
        active: service.active,
      });
      setEditor({
        open: true,
        mode: "edit",
        serviceId: service.id,
      });
    },
    onError: (error) => {
      setPageError(getApiErrorMessage(error, "Unable to load service details."));
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (editor.mode === "edit" && editor.serviceId) {
      updateMutation.mutate({ id: editor.serviceId, payload: values });
      return;
    }

    createMutation.mutate({
      name: values.name,
      price: values.price,
      durationMinutes: values.durationMinutes,
      active: values.active,
    });
  });

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);

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
            <Typography className="auth-kicker">Module 4</Typography>
            <Typography variant="h4" sx={{ marginTop: 1 }}>
              Service Management
            </Typography>
            <Typography sx={{ marginTop: 0.5, color: "var(--muted)" }}>
              Manage service catalog, pricing, duration, and active status for your salon.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button component={Link} to="/owner/customers" variant="outlined">
              Customers
            </Button>
            <Button component={Link} to="/owner/appointments" variant="outlined">
              Appointments
            </Button>
            <Button component={Link} to="/owner/users" variant="outlined">
              Users
            </Button>
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
                  price: 0,
                  durationMinutes: 45,
                  active: true,
                });
                setEditor({ open: true, mode: "create" });
              }}
            >
              Add service
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

        {servicesQuery.isLoading ? (
          <Box sx={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box className="table-scroll">
            <Table sx={{ marginTop: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>Service Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.price.toFixed(2)}</TableCell>
                  <TableCell>{service.durationMinutes}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={service.active ? "success" : "default"}
                      label={service.active ? "Active" : "Inactive"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setPageError(null);
                          editLoaderMutation.mutate(service.id);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Delete service ${service.name}? This action cannot be undone.`
                          );
                          if (confirmed) {
                            setPageError(null);
                            deleteMutation.mutate(service.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {!services.length ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No services found.
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
        <DialogTitle>{editor.mode === "create" ? "Create service" : "Update service"}</DialogTitle>
        <DialogContent>
          <Box sx={{ marginTop: 1, display: "grid", gap: 2 }}>
            <TextField
              label="Service Name"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Price"
              type="number"
              slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
              error={Boolean(errors.price)}
              helperText={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />
            <TextField
              label="Duration Minutes"
              type="number"
              slotProps={{ htmlInput: { step: "1", min: 5 } }}
              error={Boolean(errors.durationMinutes)}
              helperText={errors.durationMinutes?.message}
              {...register("durationMinutes", { valueAsNumber: true })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(event) => {
                    setValue("active", event.target.checked);
                  }}
                />
              }
              label="Active service"
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
