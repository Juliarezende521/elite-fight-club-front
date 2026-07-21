import { createContext, useContext } from "react";
import {
  backendUserToAppUser,
  type AuthSessionState,
  type BackendAuthenticatedUser,
} from "@/lib/auth/session";
import type { Role } from "@/types";

export interface AuthContextValue extends AuthSessionState {
  loginWithFirebase(email: string, password: string): Promise<BackendAuthenticatedUser>;
  loginDemo(role: Role): Promise<void>;
  logout(): Promise<void>;
  refreshSession(): Promise<void>;
  homePath: string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}

export function useAppUser() {
  const { authenticatedUser } = useAuth();
  return authenticatedUser ? backendUserToAppUser(authenticatedUser) : null;
}
