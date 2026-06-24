/** Workspace API service layer. */
import { http } from "@/lib/api";
import type { Membership, Paginated, Workspace } from "@/types";

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export type UpdateWorkspacePayload = Partial<CreateWorkspacePayload>;

export const workspaceService = {
  list: () => http.get<Paginated<Workspace>>("/workspaces/"),

  create: (payload: CreateWorkspacePayload) =>
    http.post<Workspace>("/workspaces/", payload),

  get: (slug: string) => http.get<Workspace>(`/workspaces/${slug}/`),

  update: (slug: string, payload: UpdateWorkspacePayload) =>
    http.patch<Workspace>(`/workspaces/${slug}/`, payload),

  remove: (slug: string) => http.delete<void>(`/workspaces/${slug}/`),

  members: (slug: string) =>
    http.get<Membership[]>(`/workspaces/${slug}/members/`),
};
