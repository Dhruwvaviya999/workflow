/** Task API service layer. */
import { http } from "@/lib/api";
import type { Paginated, Task, TaskPriority, TaskStatus } from "@/types";

export interface TaskListParams {
  workspace: string;
  project?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface CreateTaskPayload {
  project: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
  start_date?: string | null;
  estimated_hours?: string | null;
  labels?: string[];
}

export type UpdateTaskPayload = Partial<Omit<CreateTaskPayload, "project">>;

export const taskService = {
  list: (params: TaskListParams) =>
    http.get<Paginated<Task>>("/tasks/", params),

  get: (id: string) => http.get<Task>(`/tasks/${id}/`),

  create: (payload: CreateTaskPayload) =>
    http.post<Task>("/tasks/", payload),

  update: (id: string, payload: UpdateTaskPayload) =>
    http.patch<Task>(`/tasks/${id}/`, payload),

  remove: (id: string) => http.delete<void>(`/tasks/${id}/`),

  assign: (id: string, assignee_id: string | null) =>
    http.patch<Task>(`/tasks/${id}/assign/`, { assignee_id }),

  setStatus: (id: string, status: TaskStatus) =>
    http.patch<Task>(`/tasks/${id}/status/`, { status }),
};
