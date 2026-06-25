"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  taskService,
  type CreateTaskPayload,
  type TaskListParams,
  type UpdateTaskPayload,
} from "@/services/tasks";
import type { TaskStatus } from "@/types";

const KEYS = {
  list: (params: TaskListParams) => ["tasks", params] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
};

export function useTasks(params: TaskListParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => taskService.list(params),
    enabled: Boolean(params.workspace),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => taskService.get(id),
    enabled: Boolean(id),
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["tasks"] });
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      taskService.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: invalidate,
  });
}

export function useSetTaskStatus() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.setStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useAssignTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, assignee_id }: { id: string; assignee_id: string | null }) =>
      taskService.assign(id, assignee_id),
    onSuccess: invalidate,
  });
}
