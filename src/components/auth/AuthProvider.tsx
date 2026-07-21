import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { appEnv } from "@/lib/env";
import { mockUsers } from "@/mocks";
import { queryKeys } from "@/lib/queryKeys";
import { AuthContext, type AuthContextValue } from "@/lib/auth/context";
import {
  fetchAuthenticatedUser,
  getDemoSession,
  getFirebaseIdToken,
  setDemoSession,
  signInWithFirebaseCredentials,
  signOutEverywhere,
  subscribeFirebaseAuth,
} from "@/lib/auth/service";
import { roleHomePath, type BackendAuthenticatedUser } from "@/lib/auth/session";
import type { Role } from "@/types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoVersion, setDemoVersion] = useState(0);

  const demoSession = appEnv.enableDemoMode ? getDemoSession() : null;
  const hasCredential = Boolean(firebaseUser || demoSession);

  useEffect(() => {
    const unsubscribe = subscribeFirebaseAuth(async (user) => {
      setFirebaseUser(user);
      setIdToken(user ? await getFirebaseIdToken() : null);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const sessionQuery = useQuery({
    queryKey: queryKeys.authMe,
    queryFn: async () => {
      if (demoSession) {
        return {
          id: Number(demoSession.user.id),
          nome: demoSession.user.name,
          email: demoSession.user.email,
          perfil: demoSession.user.role,
          ativo: true,
          academia: { id: 1, nome: "Elite Fight Club", status: "ATIVA" },
          alunoId: demoSession.user.role === "ALUNO" ? Number(demoSession.user.id) : null,
          professorId: demoSession.user.role === "PROFESSOR" ? Number(demoSession.user.id) : null,
        } satisfies BackendAuthenticatedUser;
      }

      return fetchAuthenticatedUser();
    },
    enabled: !authLoading && hasCredential,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      const status = typeof error === "object" && error && "status" in error ? error.status : null;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 1;
    },
  });

  const loginWithFirebase = useCallback(
    async (email: string, password: string) => {
      await signInWithFirebaseCredentials(email, password);
      const user = await queryClient.fetchQuery({
        queryKey: queryKeys.authMe,
        queryFn: fetchAuthenticatedUser,
        staleTime: 1000 * 60 * 5,
      });
      return user;
    },
    [queryClient],
  );

  const loginDemo = useCallback(
    async (role: Role) => {
      if (!appEnv.enableDemoMode) {
        throw new Error("Modo demonstração desativado neste ambiente.");
      }

      const user =
        role === "ALUNO"
          ? mockUsers.aluno
          : role === "PROFESSOR"
            ? mockUsers.professor
            : mockUsers.admin;

      setDemoSession({ user, token: "mock-firebase-token", source: "demo" });
      setDemoVersion((value) => value + 1);
      await queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await signOutEverywhere();
    setFirebaseUser(null);
    setIdToken(null);
    setDemoVersion((value) => value + 1);
    queryClient.clear();
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
  }, [queryClient]);

  const authenticatedUser = sessionQuery.data ?? null;
  const role = authenticatedUser?.perfil ?? null;
  const academia = authenticatedUser?.academia ?? null;
  const homePath = role ? roleHomePath(role) : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      idToken,
      authLoading,
      authenticatedUser,
      role,
      academia,
      backendSessionLoading: sessionQuery.isFetching,
      backendSessionError: sessionQuery.error,
      isDemoSession: Boolean(demoSession),
      isAuthenticated: Boolean(authenticatedUser?.ativo && academia),
      isReady: !authLoading && !sessionQuery.isFetching,
      loginWithFirebase,
      loginDemo,
      logout,
      refreshSession,
      homePath,
    }),
    [
      firebaseUser,
      idToken,
      authLoading,
      authenticatedUser,
      role,
      academia,
      sessionQuery.isFetching,
      sessionQuery.error,
      demoSession,
      homePath,
      loginWithFirebase,
      loginDemo,
      logout,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
