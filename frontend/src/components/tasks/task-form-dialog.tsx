"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/constants/domain";
import { getApiErrorMessage } from "@/lib/api-error";
import { useProjects } from "@/hooks/use-projects";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { taskSchema, type TaskInput } from "@/lib/validations/task";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Strip empty-string date/number fields so the API receives null/omitted. */
function clean(values: TaskInput) {
  return {
    title: values.title,
    description: values.description || "",
    status: values.status,
    priority: values.priority,
    due_date: values.due_date || null,
    start_date: values.start_date || null,
    estimated_hours: values.estimated_hours || null,
  };
}

export function TaskFormDialog({
  trigger,
  workspaceSlug,
  fixedProjectId,
  task,
}: {
  trigger: ReactNode;
  workspaceSlug: string;
  fixedProjectId?: string;
  task?: Task;
}) {
  const isEdit = Boolean(task);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>(
    fixedProjectId ?? task?.project.id ?? "",
  );

  // Only need the project list when the project isn't fixed.
  const { data: projectsData } = useProjects({
    workspace: fixedProjectId || isEdit ? "" : workspaceSlug,
  });
  const projects = projectsData?.results ?? [];

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "todo",
      priority: task?.priority ?? "medium",
      due_date: task?.due_date ?? "",
      start_date: task?.start_date ?? "",
      estimated_hours: task?.estimated_hours ?? "",
    },
  });

  const onSubmit = async (values: TaskInput) => {
    setFormError(null);
    const payload = clean(values);
    try {
      if (isEdit && task) {
        await updateTask.mutateAsync({ id: task.id, payload });
      } else {
        if (!projectId) {
          setFormError("Please choose a project.");
          return;
        }
        await createTask.mutateAsync({ project: projectId, ...payload });
        reset();
      }
      setOpen(false);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {!isEdit && !fixedProjectId && (
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as TaskInput["status"])
                }
              >
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) =>
                  setValue("priority", v as TaskInput["priority"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" type="date" {...register("due_date")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_hours">Estimated hours</Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.5"
              min="0"
              {...register("estimated_hours")}
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
