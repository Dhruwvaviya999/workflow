import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create account" };

/** Placeholder. Registration form is built in Phase 2. */
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Registration is wired up in Phase 2.
        </p>
      </div>
    </main>
  );
}
