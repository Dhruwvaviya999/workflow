"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { formatDate } from "@/lib/format";
import { useWorkspaceContext } from "@/lib/workspace-context";
import {
  useArchiveProject,
  useDeleteProject,
  useProject,
} from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ListSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskTable } from "@/components/tasks/task-table";

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { activeWorkspace } = useWorkspaceContext();

  const { data: project, isLoading, isError, refetch } = useProject(id);
  const { data: tasksData } = useTasks({
    workspace: activeWorkspace?.slug ?? "",
    project: id,
  });
  const archiveProject = useArchiveProject();
  const deleteProject = useDeleteProject();

  const canManage =
    activeWorkspace?.my_role === "owner" || activeWorkspace?.my_role === "admin";

  if (isLoading) return <ListSkeleton rows={4} />;
  if (isError || !project) {
    return <ErrorState message="Project not found." onRetry={refetch} />;
  }

  const tasks = tasksData?.results ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/projects"
        className="text-sm text-muted-foreground underline"
      >
        ← All projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              {project.archived && (
                <span className="text-xs text-muted-foreground">archived</span>
              )}
              <span className="text-xs text-muted-foreground">
                created {formatDate(project.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <ProjectFormDialog
            project={project}
            trigger={<Button variant="outline">Edit</Button>}
          />
          {canManage && (
            <Button
              variant="outline"
              onClick={() =>
                archiveProject.mutate({ id: project.id, archived: !project.archived })
              }
            >
              {project.archived ? "Unarchive" : "Archive"}
            </Button>
          )}
          {canManage && (
            <ConfirmDialog
              trigger={<Button variant="destructive">Delete</Button>}
              title="Delete project?"
              description="This permanently removes the project and its tasks."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                await deleteProject.mutateAsync(project.id);
                router.replace("/dashboard/projects");
              }}
            />
          )}
        </div>
      </div>

      {project.description && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            {project.description}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Tasks ({tasks.length})</CardTitle>
          <TaskFormDialog
            workspaceSlug={activeWorkspace?.slug ?? ""}
            fixedProjectId={project.id}
            trigger={<Button size="sm">New task</Button>}
          />
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Add the first task to this project."
            />
          ) : (
            <TaskTable tasks={tasks} showProject={false} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
