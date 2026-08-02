import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";

import { authService } from "../../services/authService";
import { AuthLayout } from "../../layouts/AuthLayout";

const registerSchema = z
  .object({
    salonName: z.string().min(1, "Salon name is required.").max(120),
    ownerName: z.string().min(1, "Owner name is required.").max(120),
    email: z.email("Please enter a valid email address."),
    mobile: z
      .string()
      .min(10, "Mobile must be at least 10 digits.")
      .max(15)
      .regex(/^[0-9]+$/, "Mobile must contain only digits."),
    password: z.string().min(8, "Password must be at least 8 characters.").max(128),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterSalonPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      salonName: "",
      ownerName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    },
  });

  return (
    <AuthLayout>
      <div className="auth-card">
        <Typography component="h2" variant="h4" sx={{ margin: 0 }}>
          Register your salon
        </Typography>
        <Typography className="auth-subtitle">Create your salon account and complete payment to get started.</Typography>

        <form className="auth-form" onSubmit={handleSubmit((values) => registerMutation.mutate(values))}>
          <Stack spacing={2}>
            <TextField
              id="salonName"
              label="Salon name"
              placeholder="Your salon name"
              error={Boolean(errors.salonName)}
              helperText={errors.salonName?.message}
              {...register("salonName")}
            />
            <TextField
              id="ownerName"
              label="Owner name"
              placeholder="Full name"
              error={Boolean(errors.ownerName)}
              helperText={errors.ownerName?.message}
              {...register("ownerName")}
            />
            <TextField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="owner@salon.local"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register("email")}
            />
            <TextField
              id="mobile"
              label="Mobile"
              placeholder="10 to 15 digits"
              error={Boolean(errors.mobile)}
              helperText={errors.mobile?.message}
              {...register("mobile")}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register("password")}
            />
            <TextField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </Stack>

          {registerMutation.isSuccess ? (
            <Alert severity="success">
              Salon registered successfully. Please sign in to complete payment.
            </Alert>
          ) : null}

          {registerMutation.isError ? (
            <Alert severity="error">
              {(registerMutation.error as { response?: { data?: { message?: string } } })?.response?.data
                ?.message || "Unable to register. Please try again."}
            </Alert>
          ) : null}

          <Button type="submit" variant="contained" disabled={registerMutation.isPending || registerMutation.isSuccess}>
            {registerMutation.isPending ? "Registering..." : "Register salon"}
          </Button>
        </form>

        <Typography className="auth-help" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ textDecoration: "underline" }}>
            Sign in
          </Link>
        </Typography>
      </div>
    </AuthLayout>
  );
}
