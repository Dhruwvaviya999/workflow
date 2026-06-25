"use client";

import { useState } from "react";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/constants/domain";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useTasks } from "@/hooks/use-tasks";
import type { TaskPriority, TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/shared/pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskTable } from "@/components/tasks/task-table";

export default function TasksPage() {
  const { activeWorkspace, isLoading: wsLoading } = useWorkspaceContext();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [page, setPage] = useState(1);

  const slug = activeWorkspace?.slug ?? "";
  const { data, isLoading, isError, refetch } = useTasks({
    workspace: slug,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
    page,
  });

  if (!wsLoading && !activeWorkspace) {
    return (
      <EmptyState
        title="No workspace selected"
        description="Select a workspace from the top bar to view tasks."
      />
    );
  }

  const tasks = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <TaskFormDialog
          workspaceSlug={slug}
          trigger={<Button>New task</Button>}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          placeholder="Search tasks…"
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as TaskStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={priority}
          onValueChange={(v) => {
            setPriority(v as TaskPriority | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TASK_PRIORITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <ListSkeleton />}
      {isError && <ErrorState message="Could not load tasks." onRetry={refetch} />}

      {!isLoading && !isError && tasks.length === 0 && (
        <EmptyState
          title="No tasks found"
          description="Try adjusting filters, or create a new task."
        />
      )}

      {tasks.length > 0 && (
        <>
          <TaskTable tasks={tasks} />
          <Pagination page={page} count={data?.count ?? 0} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
