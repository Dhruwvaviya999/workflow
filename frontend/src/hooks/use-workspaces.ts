"use client";

/** Data hooks for workspaces (TanStack Query + service layer). */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  workspaceService,
  type CreateWorkspacePayload,
} from "@/services/workspaces";

const KEYS = {
  all: ["workspaces"] as const,
  detail: (slug: string) => ["workspaces", slug] as const,
  members: (slug: string) => ["workspaces", slug, "members"] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: workspaceService.list,
  });
}

export function useWorkspace(slug: string) {
  return useQuery({
    queryKey: KEYS.detail(slug),
    queryFn: () => workspaceService.get(slug),
    enabled: Boolean(slug),
  });
}

export function useWorkspaceMembers(slug: string) {
  return useQuery({
    queryKey: KEYS.members(slug),
    queryFn: () => workspaceService.members(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) =>
      workspaceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
