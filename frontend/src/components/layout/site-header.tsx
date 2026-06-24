import Link from "next/link";

import { APP_NAME, ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";

/** Top navigation shell. Auth-aware links arrive in Phase 2. */
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href={ROUTES.home} className="font-semibold">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.login}>Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={ROUTES.dashboard}>Dashboard</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
