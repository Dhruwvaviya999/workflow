/**
 * Token persistence.
 *
 * Tokens live in localStorage to match the bearer-token (SimpleJWT) approach.
 * Centralized here so storage strategy can be swapped later (e.g. to
 * httpOnly cookies) without touching call sites.
 */
import { STORAGE_KEYS } from "@/constants";

export const authStorage = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEYS.accessToken);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEYS.refreshToken);
  },
  set(access: string, refresh: string) {
    window.localStorage.setItem(STORAGE_KEYS.accessToken, access);
    window.localStorage.setItem(STORAGE_KEYS.refreshToken, refresh);
  },
  setAccess(access: string) {
    window.localStorage.setItem(STORAGE_KEYS.accessToken, access);
  },
  clear() {
    window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
  },
};
