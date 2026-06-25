"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import { PROJECT_STATUS_OPTIONS } from "@/constants/domain";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";
import type { Project } from "@/types";
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

/**
 * Create/edit project dialog. Pass `project` to edit, omit to create.
 * `workspaceSlug` is required when creating.
 */
export function ProjectFormDialog({
  trigger,
  workspaceSlug,
  project,
}: {
  trigger: ReactNode;
  workspaceSlug?: string;
  project?: Project;
}) {
  const isEdit = Boolean(project);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      color: project?.color ?? "#6366f1",
      status: project?.status ?? "active",
    },
  });

  const onSubmit = async (values: ProjectInput) => {
    setFormError(null);
    try {
      if (isEdit && project) {
        await updateProject.mutateAsync({ id: project.id, payload: values });
      } else if (workspaceSlug) {
        await createProject.mutateAsync({ workspace: workspaceSlug, ...values });
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
          <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" type="color" className="h-9 p-1" {...register("color")} />
              {errors.color && (
                <p className="text-sm text-destructive">{errors.color.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as ProjectInput["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
