/** Extract a human-readable message from our consistent API error envelope. */
import { AxiosError } from "axios";

import type { ApiError } from "@/types";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof AxiosError && error.response?.data) {
    const detail = (error.response.data as ApiError)?.error?.detail;

    if (typeof detail === "string") return detail;

    if (detail && typeof detail === "object") {
      // Field errors like { email: ["already exists"] } or { detail: "..." }.
      const first = Object.values(detail as Record<string, unknown>)[0];
      if (Array.isArray(first) && first.length) return String(first[0]);
      if (typeof first === "string") return first;
    }
  }
  return fallback;
}
