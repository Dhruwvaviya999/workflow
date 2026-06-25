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

// ---- Projects ----
export type ProjectStatus = "active" | "on_hold" | "completed";

export interface Project {
  id: string;
  workspace: string; // slug
  name: string;
  slug: string;
  description: string;
  color: string;
  status: ProjectStatus;
  archived: boolean;
  archived_at: string | null;
  owner: User;
  created_by: User | null;
  updated_by: User | null;
  task_count: number;
  created_at: string;
  updated_at: string;
}

// ---- Tasks ----
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "completed"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface ProjectBrief {
  id: string;
  name: string;
  slug: string;
}

export interface Task {
  id: string;
  project: ProjectBrief;
  workspace: string; // slug
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: User | null;
  reporter: User | null;
  due_date: string | null;
  start_date: string | null;
  estimated_hours: string | null;
  labels: string[];
  created_by: User | null;
  updated_by: User | null;
  created_at: string;
  updated_at: string;
}

// ---- Documents ----
export interface Document {
  id: string;
  workspace: string; // slug
  project: string | null; // slug
  title: string;
  description: string;
  file_url: string | null;
  file_type: string;
  file_size: number;
  uploaded_by: User | null;
  created_at: string;
  updated_at: string;
}

// ---- Dashboard ----
export interface DashboardSummary {
  workspace: string;
  projects: { total: number; active: number; archived: number };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  documents: { total: number };
  recent_projects: Project[];
  recent_tasks: Task[];
}

/** Consistent API error envelope (see backend api_exception_handler). */
export interface ApiError {
  error: {
    status_code: number;
    type: string;
    detail: unknown;
  };
}
