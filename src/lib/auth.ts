import type { Role, User } from "@/types";
import { mockUsers } from "@/mocks";
import { appEnv } from "@/lib/env";
import {
  clearDemoSession,
  getAuthorizationToken,
  getDemoSession,
  getFirebaseIdToken,
  setDemoSession,
  signInWithFirebaseCredentials,
  signOutEverywhere,
  subscribeFirebaseAuth,
} from "@/lib/auth/service";
import { roleHomePath } from "@/lib/auth/session";

const KEY = "efc.session";

export interface Session {
  user: User;
  token?: string;
  source: "demo";
}

export function getSession(): Session | null {
  return getDemoSession() as Session | null;
}

export function signIn(role: Role): Session {
  if (!appEnv.enableDemoMode) {
    throw new Error("Modo demonstração desativado neste ambiente.");
  }

  const user =
    role === "ALUNO"
      ? mockUsers.aluno
      : role === "PROFESSOR"
        ? mockUsers.professor
        : mockUsers.admin;
  const session: Session = { user, token: "mock-firebase-token", source: "demo" };
  setDemoSession(session);
  return session;
}

export async function signInWithFirebase(email: string, password: string) {
  return signInWithFirebaseCredentials(email, password);
}

export const onFirebaseUserChanged = subscribeFirebaseAuth;
export { getAuthorizationToken, getFirebaseIdToken };

export async function signOut() {
  await signOutEverywhere();
  clearDemoSession();
}

export function homePathFor(role: Role): string {
  return roleHomePath(role);
}
