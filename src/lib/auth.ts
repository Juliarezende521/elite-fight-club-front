import type { Role, User } from "@/types";
import { mockUsers } from "@/mocks";

const KEY = "efc.session";

export interface Session {
  user: User;
  token?: string;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signIn(role: Role): Session {
  const user =
    role === "ALUNO"
      ? mockUsers.aluno
      : role === "PROFESSOR"
        ? mockUsers.professor
        : mockUsers.admin;
  const session: Session = { user, token: "mock-firebase-token" };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  localStorage.removeItem(KEY);
}

export function homePathFor(role: Role): string {
  if (role === "ALUNO") return "/aluno/dashboard";
  if (role === "PROFESSOR") return "/professor/dashboard";
  return "/admin/dashboard";
}
