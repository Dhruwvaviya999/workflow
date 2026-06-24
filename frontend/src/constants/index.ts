/** App-wide constants. Keep environment reads centralized here. */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const APP_NAME = "AI Knowledge & Workflow Assistant";

/** localStorage keys for the JWT tokens (auth flows arrive in Phase 2). */
export const STORAGE_KEYS = {
  accessToken: "aiw.access_token",
  refreshToken: "aiw.refresh_token",
} as const;

/** Centralized route map so links never hardcode strings. */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
} as const;
