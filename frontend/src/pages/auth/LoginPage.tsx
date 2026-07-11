import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";

import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { AuthLayout } from "../../layouts/AuthLayout";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function resolveRoleLanding(role: string): string {
  switch (role) {
    case "OWNER":
      return "/owner";
    case "RECEPTION":
      return "/reception";
    case "STAFF":
      return "/staff";
    default:
      return "/";
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession(data);

      const state = location.state as LocationState | null;
      const from = state?.from?.pathname;

      navigate(from || resolveRoleLanding(data.role), { replace: true });
    },
  });

  if (user && accessToken) {
    return <Navigate to={resolveRoleLanding(user.role)} replace />;
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <Typography component="h2" variant="h4" sx={{ margin: 0 }}>
          Sign in
        </Typography>
        <Typography className="auth-subtitle">Use your account credentials to continue.</Typography>

        <form className="auth-form" onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
          <Stack spacing={2}>
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
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register("password")}
            />
          </Stack>

          {loginMutation.isError ? (
            <Alert severity="error">Unable to sign in. Please verify your credentials.</Alert>
          ) : null}

          <Button type="submit" variant="contained" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <Typography className="auth-help">Local default: owner@salon.local / ChangeMe123!</Typography>
      </div>
    </AuthLayout>
  );
}
