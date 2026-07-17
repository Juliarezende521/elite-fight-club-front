import type { Role, User } from "@/types";
import { mockUsers } from "@/mocks";
import { appEnv } from "@/lib/env";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";

const KEY = "efc.session";

export interface Session {
  user: User;
  token?: string;
  source: "demo" | "firebase";
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
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export async function signInWithFirebase(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase não está configurado neste ambiente.");
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export function onFirebaseUserChanged(callback: (user: FirebaseUser | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}

export async function getFirebaseIdToken() {
  const auth = getFirebaseAuth();
  return auth?.currentUser ? auth.currentUser.getIdToken() : null;
}

export async function getAuthorizationToken() {
  const firebaseToken = await getFirebaseIdToken();
  if (firebaseToken) return firebaseToken;

  const session = getSession();
  if (appEnv.enableDemoMode && session?.source === "demo") {
    return session.token ?? null;
  }

  return null;
}

export async function signOut() {
  const auth = getFirebaseAuth();
  if (auth?.currentUser) {
    await firebaseSignOut(auth);
  }
  localStorage.removeItem(KEY);
}

export function homePathFor(role: Role): string {
  if (role === "ALUNO") return "/aluno/dashboard";
  if (role === "PROFESSOR") return "/professor/dashboard";
  return "/admin/dashboard";
}
