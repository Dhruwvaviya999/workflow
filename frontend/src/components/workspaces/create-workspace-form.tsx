"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Name is required.").max(150),
  description: z.string().max(2000).optional(),
});
type FormInput = z.infer<typeof schema>;

export function CreateWorkspaceForm() {
  const createWorkspace = useCreateWorkspace();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormInput) => {
    setFormError(null);
    try {
      await createWorkspace.mutateAsync(values);
      reset();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Workspace name</Label>
        <Input id="name" placeholder="Acme Inc." {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" placeholder="What is this workspace for?" {...register("description")} />
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create workspace"}
      </Button>
    </form>
  );
}
