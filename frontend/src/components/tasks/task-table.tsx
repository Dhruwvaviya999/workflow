"use client";

import Link from "next/link";

import { TASK_STATUS_OPTIONS } from "@/constants/domain";
import { formatDate } from "@/lib/format";
import { useSetTaskStatus } from "@/hooks/use-tasks";
import type { Task } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskPriorityBadge } from "@/components/shared/badges";

/** Reusable task table with an inline status dropdown. */
export function TaskTable({
  tasks,
  showProject = true,
}: {
  tasks: Task[];
  showProject?: boolean;
}) {
  const setStatus = useSetTaskStatus();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          {showProject && <TableHead>Project</TableHead>}
          <TableHead>Priority</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Due</TableHead>
          <TableHead className="w-[150px]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">
              <Link
                href={`/dashboard/tasks/${task.id}`}
                className="hover:underline"
              >
                {task.title}
              </Link>
            </TableCell>
            {showProject && (
              <TableCell className="text-muted-foreground">
                {task.project.name}
              </TableCell>
            )}
            <TableCell>
              <TaskPriorityBadge priority={task.priority} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {task.assignee?.full_name || task.assignee?.email || "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(task.due_date)}
            </TableCell>
            <TableCell>
              <Select
                value={task.status}
                onValueChange={(v) =>
                  setStatus.mutate({ id: task.id, status: v as Task["status"] })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
