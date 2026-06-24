/** Shared application types. */

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

/** Authenticated user / profile. */
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_staff: boolean;
  created_at: string;
}

/** Token pair + user returned by the login endpoint. */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export type WorkspaceRole = "owner" | "admin" | "member";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  owner: User;
  member_count: number;
  my_role: WorkspaceRole | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user: User;
  role: WorkspaceRole;
  created_at: string;
}

/** Consistent API error envelope (see backend api_exception_handler). */
export interface ApiError {
  error: {
    status_code: number;
    type: string;
    detail: unknown;
  };
}
