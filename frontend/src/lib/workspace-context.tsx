"use client";

/**
 * Active-workspace context.
 *
 * Phase 3 data is workspace-scoped, so the UI needs an ambient "current
 * workspace". This loads the user's workspaces, remembers the selected one in
 * localStorage, and exposes it to all feature pages.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useWorkspaces } from "@/hooks/use-workspaces";
import type { Workspace } from "@/types";

const STORAGE_KEY = "aiw.active_workspace";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (slug: string) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useWorkspaces();
  const workspaces = useMemo(() => data?.results ?? [], [data]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Restore the persisted selection once on mount.
  useEffect(() => {
    setActiveSlug(window.localStorage.getItem(STORAGE_KEY));
  }, []);

  // Fall back to the first workspace if none/invalid is selected.
  useEffect(() => {
    if (!workspaces.length) return;
    const exists = workspaces.some((w) => w.slug === activeSlug);
    if (!exists) {
      setActiveSlug(workspaces[0].slug);
    }
  }, [workspaces, activeSlug]);

  const setActiveWorkspace = (slug: string) => {
    setActiveSlug(slug);
    window.localStorage.setItem(STORAGE_KEY, slug);
  };

  const activeWorkspace =
    workspaces.find((w) => w.slug === activeSlug) ?? null;

  const value: WorkspaceContextValue = {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    isLoading,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceContext must be used within a WorkspaceProvider.",
    );
  }
  return ctx;
}
