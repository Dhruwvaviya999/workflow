/** Document API service layer (multipart upload + download). */
import { api, http } from "@/lib/api";
import type { Document, Paginated } from "@/types";

export interface DocumentListParams {
  workspace: string;
  project?: string;
  file_type?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface CreateDocumentInput {
  workspace: string;
  title: string;
  description?: string;
  project?: string | null;
  file: File;
}

function toFormData(input: CreateDocumentInput): FormData {
  const fd = new FormData();
  fd.append("workspace", input.workspace);
  fd.append("title", input.title);
  if (input.description) fd.append("description", input.description);
  if (input.project) fd.append("project", input.project);
  fd.append("file", input.file);
  return fd;
}

export const documentService = {
  list: (params: DocumentListParams) =>
    http.get<Paginated<Document>>("/documents/", params),

  get: (id: string) => http.get<Document>(`/documents/${id}/`),

  create: async (input: CreateDocumentInput) => {
    const { data } = await api.post<Document>("/documents/", toFormData(input), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: (
    id: string,
    payload: { title?: string; description?: string; project?: string | null },
  ) => http.patch<Document>(`/documents/${id}/`, payload),

  remove: (id: string) => http.delete<void>(`/documents/${id}/`),

  /** Fetch the file as a blob (auth header is attached by the axios client). */
  download: async (id: string): Promise<Blob> => {
    const { data } = await api.get(`/documents/${id}/download/`, {
      responseType: "blob",
    });
    return data as Blob;
  },
};
