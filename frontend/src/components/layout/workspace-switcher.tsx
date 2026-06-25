"use client";

import { useWorkspaceContext } from "@/lib/workspace-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Dropdown to choose the active workspace; persists via WorkspaceProvider. */
export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace } =
    useWorkspaceContext();

  if (!workspaces.length) return null;

  return (
    <Select
      value={activeWorkspace?.slug ?? undefined}
      onValueChange={setActiveWorkspace}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select workspace" />
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((w) => (
          <SelectItem key={w.id} value={w.slug}>
            {w.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
