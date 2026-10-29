import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { appEnv } from "@/lib/env";
import { mockUsers } from "@/mocks";
import { AuthContext, type AuthContextValue } from "@/lib/auth/context";
import {
  clearDemoSession,
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
  const [demo, setDemo] = useState(getDemoSession);
  const generation = useRef(0);
  const previousScope = useRef<string | null>(null);

  const loadProfile = useCallback(async () => {
    const version = generation.current;
    const profile = await fetchAuthenticatedUser();
    if (version !== generation.current) throw new Error("Sessao substituida.");
    const scope = JSON.stringify([profile.id, profile.perfil, profile.academia?.id]);
    if (scope !== previousScope.current) {
      await queryClient.cancelQueries({ predicate: (query) => query.queryKey[0] !== "auth" });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "auth" });
      previousScope.current = scope;
    }
    return profile;
  }, [queryClient]);

  const resetPrivateData = useCallback(async () => {
    generation.current += 1;
    previousScope.current = null;
    setAuthLoading(true);
    setFirebaseUser(null);
    setIdToken(null);
    setDemo(null);
    clearDemoSession();
    await queryClient.cancelQueries();
    queryClient.clear();
    return generation.current;
  }, [queryClient]);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeFirebaseAuth(async (user) => {
      const version = ++generation.current;
      setAuthLoading(true);
      setFirebaseUser(null);
      setIdToken(null);
      setDemo(null);
      await queryClient.cancelQueries();
      queryClient.clear();
      try {
        const token = user ? await getFirebaseIdToken() : null;
        if (!mounted || version !== generation.current) return;
        setFirebaseUser(user);
        setIdToken(token);
        setDemo(user ? null : getDemoSession());
      } finally {
        if (mounted && version === generation.current) setAuthLoading(false);
      }
    });
    return () => {
      mounted = false;
      generation.current += 1;
      unsubscribe();
    };
  }, [queryClient]);

  const identity = firebaseUser?.uid ?? (demo ? `demo:${demo.user.role}:${demo.user.id}` : null);
  const sessionQuery = useQuery({
    queryKey: ["auth", "me", identity],
    queryFn: async () => {
      if (!firebaseUser && demo && appEnv.enableDemoMode) {
        return {
          id: Number(demo.user.id),
          nome: demo.user.name,
          email: demo.user.email,
          perfil: demo.user.role,
          ativo: true,
          academia: { id: 1, nome: "Elite Fight Club", status: "ATIVA" },
          alunoId: demo.user.role === "ALUNO" ? Number(demo.user.id) : null,
          professorId: demo.user.role === "PROFESSOR" ? Number(demo.user.id) : null,
        } satisfies BackendAuthenticatedUser;
      }
      return loadProfile();
    },
    enabled: !authLoading && Boolean(identity),
    staleTime: 0,
    retry: false,
  });

  const loginWithFirebase = useCallback(
    async (email: string, password: string) => {
      await resetPrivateData();
      try {
        await signOutEverywhere();
        const credential = await signInWithFirebaseCredentials(email, password);
        await queryClient.cancelQueries();
        queryClient.clear();
        return await queryClient.fetchQuery({
          queryKey: ["auth", "me", credential.uid],
          queryFn: loadProfile,
          staleTime: 0,
        });
      } catch (error) {
        await resetPrivateData();
        await signOutEverywhere();
        throw error;
      }
    },
    [queryClient, resetPrivateData, loadProfile],
  );

  const loginDemo = useCallback(
    async (role: Role) => {
      if (!appEnv.enableDemoMode) throw new Error("Modo demonstração desativado neste ambiente.");
      await resetPrivateData();
      await signOutEverywhere();
      const user =
        role === "ALUNO"
          ? mockUsers.aluno
          : role === "PROFESSOR"
            ? mockUsers.professor
            : mockUsers.admin;
      setDemoSession({ user, token: "mock-firebase-token", source: "demo" });
      setDemo(getDemoSession());
      setAuthLoading(false);
    },
    [resetPrivateData],
  );

  const logout = useCallback(async () => {
    await resetPrivateData();
    try {
      await signOutEverywhere();
    } finally {
      queryClient.clear();
      setAuthLoading(false);
    }
  }, [queryClient, resetPrivateData]);

  const refreshSession = useCallback(async () => {
    setAuthLoading(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    setAuthLoading(false);
  }, [queryClient]);

  const authenticatedUser =
    !authLoading && identity && !sessionQuery.isError ? (sessionQuery.data ?? null) : null;
  const role = authenticatedUser?.perfil ?? null;
  const academia = authenticatedUser?.academia ?? null;
  const value: AuthContextValue = {
    firebaseUser,
    idToken,
    authLoading,
    authenticatedUser,
    role,
    academia,
    backendSessionLoading: sessionQuery.isFetching,
    backendSessionError: sessionQuery.error,
    isDemoSession: Boolean(demo && appEnv.enableDemoMode && !firebaseUser),
    isAuthenticated: Boolean(authenticatedUser?.ativo && academia),
    isReady: !authLoading && !sessionQuery.isFetching,
    loginWithFirebase,
    loginDemo,
    logout,
    refreshSession,
    homePath: role ? roleHomePath(role) : null,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
