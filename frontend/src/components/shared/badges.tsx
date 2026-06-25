import {
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_LABELS,
  TASK_PRIORITY_BADGE,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_BADGE,
  TASK_STATUS_LABELS,
} from "@/constants/domain";
import type { ProjectStatus, TaskPriority, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge className={TASK_STATUS_BADGE[status]}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge className={TASK_PRIORITY_BADGE[priority]}>
      {TASK_PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge className={PROJECT_STATUS_BADGE[status]}>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
}
