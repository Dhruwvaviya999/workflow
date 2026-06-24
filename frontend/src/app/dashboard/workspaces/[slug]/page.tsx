"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ROUTES } from "@/constants";
import { useWorkspace, useWorkspaceMembers } from "@/hooks/use-workspaces";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WorkspaceDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: workspace, isLoading, isError } = useWorkspace(slug);
  const { data: members } = useWorkspaceMembers(slug);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading workspace…</p>;
  }

  if (isError || !workspace) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">
          Workspace not found or you don&apos;t have access.
        </p>
        <Link href={ROUTES.dashboard} className="text-sm underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ROUTES.dashboard}
          className="text-sm text-muted-foreground underline"
        >
          ← All workspaces
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{workspace.name}</h1>
        {workspace.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {workspace.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Your role: <span className="font-medium">{workspace.my_role}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
          <CardDescription>
            People with access to this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {members?.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between border-b py-2 text-sm last:border-0"
            >
              <span>{m.user.full_name || m.user.email}</span>
              <span className="text-muted-foreground">{m.role}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Projects, tasks and documents will appear here in later phases.
      </p>
    </div>
  );
}
