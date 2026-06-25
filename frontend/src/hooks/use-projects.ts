"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  projectService,
  type CreateProjectPayload,
  type ProjectListParams,
  type UpdateProjectPayload,
} from "@/services/projects";

const KEYS = {
  list: (params: ProjectListParams) => ["projects", params] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
};

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => projectService.list(params),
    enabled: Boolean(params.workspace),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => projectService.get(id),
    enabled: Boolean(id),
  });
}

function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["projects"] });
}

export function useCreateProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectService.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      projectService.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: invalidate,
  });
}

export function useArchiveProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      archived ? projectService.archive(id) : projectService.unarchive(id),
    onSuccess: invalidate,
  });
}
