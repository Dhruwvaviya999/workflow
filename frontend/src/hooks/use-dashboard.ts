"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/services/dashboard";

export function useDashboard(workspace: string) {
  return useQuery({
    queryKey: ["dashboard", workspace],
    queryFn: () => dashboardService.summary(workspace),
    enabled: Boolean(workspace),
  });
}
