import type { User as FirebaseUser } from "firebase/auth";
import type { Role, User } from "@/types";

export interface BackendAcademia {
  id: number;
  nome: string;
  status?: "ATIVA" | "INATIVA" | string;
}

export interface BackendAuthenticatedUser {
  id: number;
  nome: string;
  email: string;
  perfil: Role;
  ativo: boolean;
  academia: BackendAcademia | null;
  alunoId: number | null;
  professorId: number | null;
}

export interface AuthSessionState {
  firebaseUser: FirebaseUser | null;
  idToken: string | null;
  authLoading: boolean;
  authenticatedUser: BackendAuthenticatedUser | null;
  role: Role | null;
  academia: BackendAcademia | null;
  backendSessionLoading: boolean;
  backendSessionError: unknown;
  isDemoSession: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
}

export function backendUserToAppUser(user: BackendAuthenticatedUser): User {
  return {
    id: String(user.id),
    name: user.nome,
    email: user.email,
    role: user.perfil,
  };
}

export function roleHomePath(role: Role): string {
  if (role === "ALUNO") return "/aluno/dashboard";
  if (role === "PROFESSOR") return "/professor/dashboard";
  return "/admin/dashboard";
}
