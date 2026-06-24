"use client";

/**
 * Global auth state.
 *
 * Wraps the app and exposes the current user plus login/register/logout
 * actions. Built on TanStack Query so the "current user" is cached, shared,
 * and refetchable. Token persistence lives in auth-storage; this layer ties
 * tokens to React state.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { ROUTES } from "@/constants";
import { setOnAuthFailure } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Only attempt to load the user if a token is present.
  const [hasToken, setHasToken] = useState<boolean>(false);
  useEffect(() => {
    setHasToken(Boolean(authStorage.getAccess()));
  }, []);

  const {
    data: user,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const clearSession = useCallback(() => {
    authStorage.clear();
    setHasToken(false);
    queryClient.removeQueries({ queryKey: ["auth", "me"] });
  }, [queryClient]);

  // If a token refresh fails inside the axios interceptor, reset here.
  useEffect(() => {
    setOnAuthFailure(() => {
      clearSession();
      router.replace(ROUTES.login);
    });
  }, [clearSession, router]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await authService.login(payload);
      authStorage.set(data.access, data.refresh);
      setHasToken(true);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authService.register(payload);
      // Auto-login right after a successful registration.
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(async () => {
    const refresh = authStorage.getRefresh();
    try {
      if (refresh) await authService.logout(refresh);
    } catch {
      // Even if the server call fails, clear the client session.
    } finally {
      clearSession();
      router.replace(ROUTES.login);
    }
  }, [clearSession, router]);

  const value: AuthContextValue = {
    user: user ?? null,
    // "Loading" only while we actually have a token to resolve.
    isLoading: hasToken && (isLoading || isFetching) && !user,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return ctx;
}
