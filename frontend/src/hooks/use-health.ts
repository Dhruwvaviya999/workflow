"use client";

/** Example data hook showing the TanStack Query + service pattern. */
import { useQuery } from "@tanstack/react-query";

import { healthService } from "@/services/health";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: healthService.check,
  });
}
