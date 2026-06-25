import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Minimal badge. Pass a `className` (e.g. from the *_BADGE color maps) to
 * recolor for statuses/priorities.
 */
function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        "bg-secondary text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
