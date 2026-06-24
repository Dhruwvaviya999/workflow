"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useWorkspaces();
  const workspaces = data?.results ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome{user?.full_name ? `, ${user.full_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a workspace or create a new one to get started.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        {/* Workspace list */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Your workspaces
          </h2>

          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading workspaces…</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              Could not load workspaces.
            </p>
          )}

          {!isLoading && workspaces.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No workspaces yet. Create your first one →
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {workspaces.map((ws) => (
              <Link key={ws.id} href={`/dashboard/workspaces/${ws.slug}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{ws.name}</CardTitle>
                    <CardDescription>
                      {ws.member_count} member
                      {ws.member_count === 1 ? "" : "s"} · {ws.my_role}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Create form */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New workspace</CardTitle>
              <CardDescription>
                You&apos;ll become the owner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateWorkspaceForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
