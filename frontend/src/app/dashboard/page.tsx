import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

/** Placeholder dashboard. Widgets/analytics arrive in later phases. */
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This is the authenticated area shell. Workspaces, projects and tasks
        will live here in later phases.
      </p>
    </div>
  );
}
