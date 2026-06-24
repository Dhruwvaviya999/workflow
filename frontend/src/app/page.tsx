import Link from "next/link";

import { APP_NAME, ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A foundation for organizing knowledge and automating workflows.
            Phase 1 sets up the base — features arrive next.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={ROUTES.dashboard}>Go to dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={ROUTES.login}>Sign in</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
