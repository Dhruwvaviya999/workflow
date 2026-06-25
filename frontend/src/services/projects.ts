/** Project API service layer. */
import { http } from "@/lib/api";
import type { Paginated, Project, ProjectStatus } from "@/types";

export interface ProjectListParams {
  workspace: string;
  search?: string;
  status?: ProjectStatus;
  archived?: boolean;
  ordering?: string;
  page?: number;
}

export interface CreateProjectPayload {
  workspace: string;
  name: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
}

export type UpdateProjectPayload = Partial<
  Omit<CreateProjectPayload, "workspace">
>;

export const projectService = {
  list: (params: ProjectListParams) =>
    http.get<Paginated<Project>>("/projects/", params),

  get: (id: string) => http.get<Project>(`/projects/${id}/`),

  create: (payload: CreateProjectPayload) =>
    http.post<Project>("/projects/", payload),

  update: (id: string, payload: UpdateProjectPayload) =>
    http.patch<Project>(`/projects/${id}/`, payload),

  remove: (id: string) => http.delete<void>(`/projects/${id}/`),

  archive: (id: string) => http.post<Project>(`/projects/${id}/archive/`),

  unarchive: (id: string) => http.post<Project>(`/projects/${id}/unarchive/`),
};
