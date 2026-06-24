"use client";

import Link from "next/link";

import { APP_NAME, ROUTES } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

/** Authenticated top bar: brand, current user, sign-out. */
export function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href={ROUTES.dashboard} className="font-semibold">
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.full_name || user.email}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
