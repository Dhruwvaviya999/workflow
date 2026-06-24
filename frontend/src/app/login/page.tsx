import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

/** Placeholder. Real auth form (RHF + Zod) is built in Phase 2. */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Authentication is wired up in Phase 2.
        </p>
      </div>
    </main>
  );
}
