"use client";

/**
 * Client-side route guard for authenticated areas.
 *
 * Note: this protects the UX, not the data. The real security boundary is the
 * backend, which rejects unauthenticated/unauthorized requests regardless of
 * what the frontend renders.
 */
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ROUTES } from "@/constants";
import { useAuth } from "@/lib/auth-context";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect is in-flight
  }

  return <>{children}</>;
}
