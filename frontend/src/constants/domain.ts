/** Display labels + option lists for project/task enums (single source). */
import type { ProjectStatus, TaskPriority, TaskStatus } from "@/types";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABELS).map(
  ([value, label]) => ({ value: value as ProjectStatus, label }),
);

export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_LABELS).map(
  ([value, label]) => ({ value: value as TaskStatus, label }),
);

export const TASK_PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_LABELS).map(
  ([value, label]) => ({ value: value as TaskPriority, label }),
);

/** Tailwind classes for status/priority badges. */
export const TASK_STATUS_BADGE: Record<TaskStatus, string> = {
  todo: "bg-secondary text-secondary-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export const TASK_PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-sky-100 text-sky-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  active: "bg-green-100 text-green-700",
  on_hold: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
};
