import { isAxiosError } from "axios";

import type { ApiErrorShape } from "../types/auth";

interface ApiErrorOptions {
  badRequestMessage?: string;
  notFoundMessage?: string;
  conflictMessage?: string;
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  options?: ApiErrorOptions
): string {
  if (!isAxiosError<ApiErrorShape>(error)) {
    return fallback;
  }

  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (status === 400) {
    return message || options?.badRequestMessage || "Request data is invalid.";
  }

  if (status === 404) {
    return message || options?.notFoundMessage || "Requested resource was not found.";
  }

  if (status === 409) {
    return message || options?.conflictMessage || "Resource already exists.";
  }

  return message || fallback;
}
