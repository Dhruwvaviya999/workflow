"use client";

import Link from "next/link";
import { useState } from "react";

import { PROJECT_STATUS_OPTIONS } from "@/constants/domain";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useProjects } from "@/hooks/use-projects";
import type { ProjectStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectStatusBadge } from "@/components/shared/badges";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/shared/states";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";

export default function ProjectsPage() {
  const { activeWorkspace, isLoading: wsLoading } = useWorkspaceContext();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [archived, setArchived] = useState<"active" | "archived">("active");
  const [page, setPage] = useState(1);

  const slug = activeWorkspace?.slug ?? "";
  const { data, isLoading, isError, refetch } = useProjects({
    workspace: slug,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    archived: archived === "archived",
    page,
  });

  const canManage =
    activeWorkspace?.my_role === "owner" || activeWorkspace?.my_role === "admin";

  if (!wsLoading && !activeWorkspace) {
    return (
      <EmptyState
        title="No workspace selected"
        description="Create or select a workspace from the top bar to manage projects."
      />
    );
  }

  const projects = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <ProjectFormDialog
          workspaceSlug={slug}
          trigger={<Button>New project</Button>}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          placeholder="Search projects…"
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as ProjectStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={archived}
          onValueChange={(v) => {
            setArchived(v as "active" | "archived");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Not archived</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <CardGridSkeleton />}
      {isError && (
        <ErrorState message="Could not load projects." onRetry={refetch} />
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing tasks."
          action={
            canManage ? (
              <ProjectFormDialog
                workspaceSlug={slug}
                trigger={<Button>New project</Button>}
              />
            ) : undefined
          }
        />
      )}

      {projects.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <CardTitle className="flex-1">{p.name}</CardTitle>
                      <ProjectStatusBadge status={p.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {p.task_count} task{p.task_count === 1 ? "" : "s"}
                    {p.archived && " · archived"}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Pagination
            page={page}
            count={data?.count ?? 0}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
