"use client";

import Link from "next/link";
import { useState } from "react";

import { formatBytes, formatDate } from "@/lib/format";
import { useWorkspaceContext } from "@/lib/workspace-context";
import {
  useDeleteDocument,
  useDocuments,
  useDownloadDocument,
} from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Pagination } from "@/components/shared/pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";

export default function DocumentsPage() {
  const { activeWorkspace, isLoading: wsLoading } = useWorkspaceContext();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const slug = activeWorkspace?.slug ?? "";
  const canManage =
    activeWorkspace?.my_role === "owner" || activeWorkspace?.my_role === "admin";

  const { data, isLoading, isError, refetch } = useDocuments({
    workspace: slug,
    search: search || undefined,
    page,
  });
  const download = useDownloadDocument();
  const deleteDocument = useDeleteDocument();

  if (!wsLoading && !activeWorkspace) {
    return (
      <EmptyState
        title="No workspace selected"
        description="Select a workspace from the top bar to view documents."
      />
    );
  }

  const documents = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <DocumentUploadDialog
          workspaceSlug={slug}
          trigger={<Button>Upload</Button>}
        />
      </div>

      <SearchBar
        placeholder="Search documents…"
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState message="Could not load documents." onRetry={refetch} />
      )}

      {!isLoading && !isError && documents.length === 0 && (
        <EmptyState
          title="No documents yet"
          description="Upload your first file to this workspace."
        />
      )}

      {documents.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/documents/${doc.id}`}
                      className="hover:underline"
                    >
                      {doc.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge>{doc.file_type || "file"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatBytes(doc.file_size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.created_at)}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        download(doc.id, `${doc.title}.${doc.file_type || "bin"}`)
                      }
                    >
                      Download
                    </Button>
                    {canManage && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        }
                        title="Delete document?"
                        description="This permanently removes the file."
                        confirmLabel="Delete"
                        destructive
                        onConfirm={() => deleteDocument.mutateAsync(doc.id)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} count={data?.count ?? 0} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
