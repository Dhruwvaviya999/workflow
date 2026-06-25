"use client";

import Link from "next/link";

import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useDashboard } from "@/hooks/use-dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ProjectStatusBadge,
  TaskPriorityBadge,
} from "@/components/shared/badges";
import { CardGridSkeleton, EmptyState } from "@/components/shared/states";
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { user } = useAuth();
  const { activeWorkspace, workspaces, isLoading: wsLoading } =
    useWorkspaceContext();
  const { data, isLoading } = useDashboard(activeWorkspace?.slug ?? "");

  // No workspaces yet → prompt to create the first one.
  if (!wsLoading && workspaces.length === 0) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create your first workspace</CardTitle>
            <CardDescription>
              Workspaces hold your projects, tasks and documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkspaceForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!wsLoading && !activeWorkspace) {
    return <EmptyState title="Select a workspace to continue." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome{user?.full_name ? `, ${user.full_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of {activeWorkspace?.name}.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">New workspace</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New workspace</DialogTitle>
            </DialogHeader>
            <CreateWorkspaceForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading || !data ? (
        <CardGridSkeleton count={8} />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total projects" value={data.projects.total} />
            <StatCard label="Active projects" value={data.projects.active} />
            <StatCard label="Archived projects" value={data.projects.archived} />
            <StatCard label="Documents" value={data.documents.total} />
            <StatCard label="Total tasks" value={data.tasks.total} />
            <StatCard label="Completed tasks" value={data.tasks.completed} />
            <StatCard label="Pending tasks" value={data.tasks.pending} />
            <StatCard
              label="Overdue tasks"
              value={data.tasks.overdue}
              hint="Past due & not done"
            />
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Recent projects</CardTitle>
                <Link
                  href="/dashboard/projects"
                  className="text-sm text-muted-foreground underline"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.recent_projects.length === 0 && (
                  <p className="text-sm text-muted-foreground">No projects yet.</p>
                )}
                {data.recent_projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}`}
                    className="flex items-center justify-between border-b py-2 text-sm last:border-0 hover:underline"
                  >
                    <span>{p.name}</span>
                    <ProjectStatusBadge status={p.status} />
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Recent tasks</CardTitle>
                <Link
                  href="/dashboard/tasks"
                  className="text-sm text-muted-foreground underline"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.recent_tasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tasks yet.</p>
                )}
                {data.recent_tasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/dashboard/tasks/${t.id}`}
                    className="flex items-center justify-between border-b py-2 text-sm last:border-0 hover:underline"
                  >
                    <span>{t.title}</span>
                    <div className="flex items-center gap-2">
                      <TaskPriorityBadge priority={t.priority} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(t.due_date)}
                      </span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
