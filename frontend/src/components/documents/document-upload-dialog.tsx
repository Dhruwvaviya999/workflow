"use client";

import { type ReactNode, useRef, useState } from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { useProjects } from "@/hooks/use-projects";
import { useUploadDocument } from "@/hooks/use-documents";
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

const NO_PROJECT = "__none__";

export function DocumentUploadDialog({
  trigger,
  workspaceSlug,
}: {
  trigger: ReactNode;
  workspaceSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectSlug, setProjectSlug] = useState<string>(NO_PROJECT);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: projectsData } = useProjects({ workspace: workspaceSlug });
  const projects = projectsData?.results ?? [];
  const upload = useUploadDocument();

  const reset = () => {
    setTitle("");
    setDescription("");
    setProjectSlug(NO_PROJECT);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!title.trim()) return setError("Title is required.");
    if (!file) return setError("Please choose a file.");

    try {
      await upload.mutateAsync({
        workspace: workspaceSlug,
        title: title.trim(),
        description: description.trim() || undefined,
        project: projectSlug === NO_PROJECT ? null : projectSlug,
        file,
      });
      reset();
      setOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-desc">Description</Label>
            <Textarea
              id="doc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Project (optional)</Label>
            <Select value={projectSlug} onValueChange={setProjectSlug}>
              <SelectTrigger>
                <SelectValue placeholder="No project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT}>No project</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.slug}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-file">File</Label>
            <Input id="doc-file" type="file" ref={fileRef} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={upload.isPending}>
              {upload.isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
