import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardHeader } from "@/components/layout/dashboard-header";

/**
 * Shell for the authenticated area.
 * AuthGuard redirects unauthenticated users to /login before rendering.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
