/**
 * Central HTTP client.
 *
 * A single axios instance everything goes through, so base URL, headers and
 * (in Phase 2) auth-token injection / refresh live in one place.
 */
import axios, { type AxiosInstance } from "axios";

import { API_BASE_URL, STORAGE_KEYS } from "@/constants";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

/**
 * Attach the JWT access token to every request when present.
 * Token storage/refresh is wired up properly in Phase 2; this is the hook.
 */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(STORAGE_KEYS.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/** Thin typed helpers so callers don't repeat `.then(r => r.data)`. */
export const http = {
  get: async <T>(url: string, params?: unknown): Promise<T> => {
    const { data } = await api.get<T>(url, { params });
    return data;
  },
  post: async <T>(url: string, body?: unknown): Promise<T> => {
    const { data } = await api.post<T>(url, body);
    return data;
  },
  patch: async <T>(url: string, body?: unknown): Promise<T> => {
    const { data } = await api.patch<T>(url, body);
    return data;
  },
  delete: async <T>(url: string): Promise<T> => {
    const { data } = await api.delete<T>(url);
    return data;
  },
};
