import { APP_NAME } from "@/constants";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
        {APP_NAME} · Phase 1 foundation
      </div>
    </footer>
  );
}
