/** Shared application types. Feature types get their own files later. */

/** Shape of the backend health-check response. */
export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  version: string;
  database: "ok" | "unavailable";
}

/** Standard DRF paginated list envelope. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Minimal user shape (expanded with auth in Phase 2). */
export interface User {
  id: string;
  email: string;
  full_name: string;
}
