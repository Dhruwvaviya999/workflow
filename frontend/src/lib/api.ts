/**
 * Central HTTP client.
 *
 * One axios instance everything goes through. Responsibilities:
 *  - inject the JWT access token on every request
 *  - transparently refresh the access token once on a 401, then retry
 *  - clear tokens and bubble the error if refresh fails
 */
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL } from "@/constants";
import { authStorage } from "@/lib/auth-storage";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Request: attach the access token -------------------------------
api.interceptors.request.use((config) => {
  const token = authStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: refresh once on 401 ----------------------------------
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Optional hook the auth layer sets so a failed refresh can reset app state.
let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(handler: () => void) {
  onAuthFailure = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const refresh = authStorage.getRefresh();

    const isAuthEndpoint = original?.url?.includes("/auth/");
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      refresh &&
      !isAuthEndpoint
    ) {
      original._retry = true;
      try {
        // Bare axios call so we don't recurse through this interceptor.
        const { data } = await axios.post<{ access: string }>(
          `${API_BASE_URL}/auth/token/refresh/`,
          { refresh },
        );
        authStorage.setAccess(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (refreshError) {
        authStorage.clear();
        onAuthFailure?.();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

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
