import { FirebaseError } from "firebase/app";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { http } from "@/lib/api";
import { appEnv } from "@/lib/env";
import type { Role } from "@/types";
import type { BackendAuthenticatedUser } from "@/lib/auth/session";

const DEMO_KEY = "efc.session";

export interface DemoSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  token?: string;
  source: "demo";
}

export function getDemoSession(): DemoSession | null {
  if (!appEnv.enableDemoMode || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function setDemoSession(session: DemoSession) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(session));
}

export function clearDemoSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_KEY);
  }
}

export function subscribeFirebaseAuth(callback: (user: FirebaseUser | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}

export async function signInWithFirebaseCredentials(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase não está configurado neste ambiente.");
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  await credential.user.getIdToken(true);
  return credential.user;
}

export async function getFirebaseIdToken(forceRefresh = false) {
  const auth = getFirebaseAuth();
  return auth?.currentUser ? auth.currentUser.getIdToken(forceRefresh) : null;
}

export async function getAuthorizationToken() {
  const firebaseToken = await getFirebaseIdToken();
  if (firebaseToken) return firebaseToken;

  const demoSession = getDemoSession();
  return demoSession?.token ?? null;
}

export async function fetchAuthenticatedUser() {
  return http.get<BackendAuthenticatedUser>("/auth/me");
}

export async function signOutEverywhere() {
  clearDemoSession();
  const auth = getFirebaseAuth();
  if (auth?.currentUser) {
    await firebaseSignOut(auth);
  }
  clearDemoSession();
}

export function mapLoginError(error: unknown) {
  if (error instanceof FirebaseError) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/invalid-email"
    ) {
      return "E-mail ou senha inválidos.";
    }
    if (error.code === "auth/user-disabled") {
      return "Este usuário está desativado. Fale com a academia.";
    }
    if (error.code === "auth/network-request-failed") {
      return "Não foi possível conectar. Verifique sua internet e tente novamente.";
    }
  }

  return "Não foi possível entrar. Verifique seus dados e tente novamente.";
}
