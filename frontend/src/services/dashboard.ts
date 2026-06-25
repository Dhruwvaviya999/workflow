/** Dashboard API service layer. */
import { http } from "@/lib/api";
import type { DashboardSummary } from "@/types";

export const dashboardService = {
  summary: (workspace: string) =>
    http.get<DashboardSummary>("/dashboard/", { workspace }),
};
