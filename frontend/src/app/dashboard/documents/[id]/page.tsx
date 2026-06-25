"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { formatBytes, formatDate } from "@/lib/format";
import { useWorkspaceContext } from "@/lib/workspace-context";
import {
  useDeleteDocument,
  useDocument,
  useDownloadDocument,
} from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState, ListSkeleton } from "@/components/shared/states";

export default function DocumentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { activeWorkspace } = useWorkspaceContext();

  const { data: doc, isLoading, isError, refetch } = useDocument(id);
  const download = useDownloadDocument();
  const deleteDocument = useDeleteDocument();

  const canManage =
    activeWorkspace?.my_role === "owner" || activeWorkspace?.my_role === "admin";

  if (isLoading) return <ListSkeleton rows={3} />;
  if (isError || !doc) {
    return <ErrorState message="Document not found." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/documents"
        className="text-sm text-muted-foreground underline"
      >
        ← All documents
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{doc.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge>{doc.file_type || "file"}</Badge>
            <span className="text-sm text-muted-foreground">
              {formatBytes(doc.file_size)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              download(doc.id, `${doc.title}.${doc.file_type || "bin"}`)
            }
          >
            Download
          </Button>
          {canManage && (
            <ConfirmDialog
              trigger={<Button variant="destructive">Delete</Button>}
              title="Delete document?"
              description="This permanently removes the file."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                await deleteDocument.mutateAsync(doc.id);
                router.replace("/dashboard/documents");
              }}
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Project" value={doc.project ?? "—"} />
          <Row
            label="Uploaded by"
            value={doc.uploaded_by?.full_name || doc.uploaded_by?.email || "—"}
          />
          <Row label="Uploaded" value={formatDate(doc.created_at)} />
          {doc.description && (
            <div className="pt-2 text-muted-foreground">{doc.description}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
