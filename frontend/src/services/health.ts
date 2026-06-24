/** Example service module — one file per API resource. */
import { http } from "@/lib/api";
import type { HealthResponse } from "@/types";

export const healthService = {
  check: () => http.get<HealthResponse>("/health/"),
};
