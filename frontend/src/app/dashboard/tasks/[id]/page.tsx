"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { TASK_STATUS_OPTIONS } from "@/constants/domain";
import { formatDate } from "@/lib/format";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import {
  useAssignTask,
  useDeleteTask,
  useSetTaskStatus,
  useTask,
} from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState, ListSkeleton } from "@/components/shared/states";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";

const UNASSIGNED = "__unassigned__";

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { activeWorkspace } = useWorkspaceContext();

  const { data: task, isLoading, isError, refetch } = useTask(id);
  const { data: members } = useWorkspaceMembers(activeWorkspace?.slug ?? "");
  const assignTask = useAssignTask();
  const setStatus = useSetTaskStatus();
  const deleteTask = useDeleteTask();

  if (isLoading) return <ListSkeleton rows={4} />;
  if (isError || !task) {
    return <ErrorState message="Task not found." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/tasks"
        className="text-sm text-muted-foreground underline"
      >
        ← All tasks
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{task.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            <Link
              href={`/dashboard/projects/${task.project.id}`}
              className="text-xs text-muted-foreground underline"
            >
              {task.project.name}
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <TaskFormDialog
            workspaceSlug={activeWorkspace?.slug ?? ""}
            task={task}
            trigger={<Button variant="outline">Edit</Button>}
          />
          <ConfirmDialog
            trigger={<Button variant="destructive">Delete</Button>}
            title="Delete task?"
            description="This permanently removes the task."
            confirmLabel="Delete"
            destructive
            onConfirm={async () => {
              await deleteTask.mutateAsync(task.id);
              router.replace("/dashboard/tasks");
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Reporter" value={task.reporter?.full_name || task.reporter?.email || "—"} />
            <Row label="Start date" value={formatDate(task.start_date)} />
            <Row label="Due date" value={formatDate(task.due_date)} />
            <Row label="Estimated hours" value={task.estimated_hours ?? "—"} />
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground">Labels</span>
              <div className="flex flex-wrap justify-end gap-1">
                {task.labels.length
                  ? task.labels.map((l) => <Badge key={l}>{l}</Badge>)
                  : "—"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <span className="text-muted-foreground">Status</span>
              <Select
                value={task.status}
                onValueChange={(v) =>
                  setStatus.mutate({ id: task.id, status: v as typeof task.status })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground">Assignee</span>
              <Select
                value={task.assignee?.id ?? UNASSIGNED}
                onValueChange={(v) =>
                  assignTask.mutate({
                    id: task.id,
                    assignee_id: v === UNASSIGNED ? null : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {(members ?? []).map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id}>
                      {m.user.full_name || m.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {task.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
            {task.description}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
