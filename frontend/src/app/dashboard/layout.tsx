import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { WorkspaceProvider } from "@/lib/workspace-context";

/**
 * Shell for the authenticated area.
 * AuthGuard redirects unauthenticated users to /login before rendering;
 * WorkspaceProvider supplies the active workspace to all feature pages.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <WorkspaceProvider>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader />
          <DashboardNav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
        </div>
      </WorkspaceProvider>
    </AuthGuard>
  );
}
