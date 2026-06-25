"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  documentService,
  type CreateDocumentInput,
  type DocumentListParams,
} from "@/services/documents";

const KEYS = {
  list: (params: DocumentListParams) => ["documents", params] as const,
  detail: (id: string) => ["documents", "detail", id] as const,
};

export function useDocuments(params: DocumentListParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => documentService.list(params),
    enabled: Boolean(params.workspace),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => documentService.get(id),
    enabled: Boolean(id),
  });
}

function useInvalidateDocuments() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["documents"] });
}

export function useUploadDocument() {
  const invalidate = useInvalidateDocuments();
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => documentService.create(input),
    onSuccess: invalidate,
  });
}

export function useDeleteDocument() {
  const invalidate = useInvalidateDocuments();
  return useMutation({
    mutationFn: (id: string) => documentService.remove(id),
    onSuccess: invalidate,
  });
}

/** Returns a function that downloads a document's file via the browser. */
export function useDownloadDocument() {
  return async (id: string, filename: string) => {
    const blob = await documentService.download(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
}
