/** Auth API service layer. */
import { http } from "@/lib/api";
import type { LoginResponse, User } from "@/types";

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    http.post<User>("/auth/register/", payload),

  login: (payload: LoginPayload) =>
    http.post<LoginResponse>("/auth/login/", payload),

  logout: (refresh: string) =>
    http.post<void>("/auth/logout/", { refresh }),

  me: () => http.get<User>("/auth/me/"),
};
