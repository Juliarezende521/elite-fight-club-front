import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { User } from "firebase/auth";
import { AuthProvider } from "./AuthProvider";
import { useAuth, type AuthContextValue } from "@/lib/auth/context";

const mocks = vi.hoisted(() => ({
  listener: null as null | ((user: User | null) => Promise<void>),
  fetch: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  demo: null as unknown,
  env: { enableDemoMode: false },
}));
vi.mock("@/lib/env", () => ({ appEnv: mocks.env }));
vi.mock("@/lib/auth/service", () => ({
  subscribeFirebaseAuth: (callback: typeof mocks.listener) => {
    mocks.listener = callback;
    return () => {};
  },
  getFirebaseIdToken: async () => "synthetic-id-token",
  getDemoSession: () => (mocks.env.enableDemoMode ? mocks.demo : null),
  clearDemoSession: () => {
    mocks.demo = null;
  },
  setDemoSession: (value: unknown) => {
    mocks.demo = value;
  },
  fetchAuthenticatedUser: mocks.fetch,
  signInWithFirebaseCredentials: mocks.signIn,
  signOutEverywhere: mocks.signOut,
}));

let auth: AuthContextValue;
const shown: string[] = [];
function Probe() {
  auth = useAuth();
  const name = auth.authenticatedUser?.nome ?? "-";
  shown.push(name);
  return <div>{name}</div>;
}
const profile = (nome: string, perfil = "ALUNO", academiaId = 1) => ({
  id: nome === "A" ? 1 : 2,
  nome,
  email: `${nome.toLowerCase()}@example.invalid`,
  perfil,
  ativo: true,
  academia: { id: academiaId, nome: "Academia teste" },
  alunoId: 1,
  professorId: null,
});
let client: QueryClient;
async function emit(uid: string | null) {
  await act(async () => {
    await mocks.listener?.(uid ? ({ uid } as User) : null);
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.env.enableDemoMode = false;
  mocks.demo = null;
  shown.length = 0;
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mocks.signOut.mockImplementation(async () => {
    await mocks.listener?.(null);
  });
  mocks.signIn.mockImplementation(async (email: string) => {
    const uid = email.startsWith("a") ? "uid-a" : "uid-b";
    await mocks.listener?.({ uid } as User);
    return { uid };
  });
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  );
});
afterEach(() => {
  cleanup();
  client.clear();
});

describe("identidade e dados privados", () => {
  it("login A, logout e login B nao reutiliza perfil nem dados privados", async () => {
    mocks.fetch.mockResolvedValue(profile("A"));
    await act(async () => {
      await auth.loginWithFirebase("a@example.invalid", "synthetic");
    });
    await waitFor(() => expect(auth.authenticatedUser?.nome).toBe("A"));
    client.setQueryData(["aluno", "faturas"], ["privado A"]);
    await act(async () => {
      await auth.logout();
    });
    expect(auth.authenticatedUser).toBeNull();
    expect(client.getQueryData(["aluno", "faturas"])).toBeUndefined();
    mocks.fetch.mockResolvedValue(profile("B"));
    await act(async () => {
      await auth.loginWithFirebase("b@example.invalid", "synthetic");
    });
    await waitFor(() => expect(auth.authenticatedUser?.nome).toBe("B"));
  });

  it.each([
    ["ADMIN", 1],
    ["PROFESSOR", 2],
  ])("troca de perfil/academia: %s %s", async (role, tenant) => {
    mocks.fetch.mockResolvedValue(profile("A"));
    await emit("uid-a");
    await waitFor(() => expect(auth.authenticatedUser?.nome).toBe("A"));
    shown.length = 0;
    client.setQueryData(["aluno", "dashboard"], "segredo A");
    let resolve!: (value: unknown) => void;
    mocks.fetch.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    await emit("uid-b");
    expect(auth.authenticatedUser).toBeNull();
    expect(client.getQueryData(["aluno", "dashboard"])).toBeUndefined();
    await act(async () => {
      resolve(profile("B", role, tenant));
    });
    await waitFor(() => expect(auth.role).toBe(role));
    expect(auth.academia?.id).toBe(tenant);
    expect(shown).not.toContain("A");
  });

  it("demo desabilitada nao cria perfil ficticio", async () => {
    mocks.demo = { user: { id: "1", role: "ADMIN" } };
    await emit(null);
    expect(auth.authenticatedUser).toBeNull();
    await expect(auth.loginDemo("ADMIN")).rejects.toThrow();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it.each(["Servidor indisponivel", "auth/me proibido"])(
    "erro %s nao restaura perfil A",
    async (message) => {
      mocks.fetch.mockResolvedValue(profile("A"));
      await emit("uid-a");
      await waitFor(() => expect(auth.authenticatedUser?.nome).toBe("A"));
      mocks.fetch.mockRejectedValue(new Error(message));
      await emit("uid-b");
      await waitFor(() => expect(auth.backendSessionError).toBeTruthy());
      expect(auth.authenticatedUser).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
    },
  );

  it("resposta atrasada de A nao substitui B", async () => {
    let resolve!: (value: unknown) => void;
    mocks.fetch.mockReturnValueOnce(
      new Promise((r) => {
        resolve = r;
      }),
    );
    await emit("uid-a");
    mocks.fetch.mockResolvedValue(profile("B"));
    await emit("uid-b");
    await waitFor(() => expect(auth.authenticatedUser?.nome).toBe("B"));
    await act(async () => {
      resolve(profile("A"));
    });
    expect(auth.authenticatedUser?.nome).toBe("B");
  });

  it("refresh limpa dados privados antes de atualizar academia", async () => {
    mocks.fetch.mockResolvedValue(profile("A"));
    await emit("uid-a");
    await waitFor(() => expect(auth.authenticatedUser?.nome).toBe("A"));
    client.setQueryData(["aluno", "dashboard"], "dados antigos");
    mocks.fetch.mockResolvedValue(profile("A", "ADMIN", 2));
    await act(async () => {
      await auth.refreshSession();
    });
    await waitFor(() => expect(auth.academia?.id).toBe(2));
    expect(client.getQueryData(["aluno", "dashboard"])).toBeUndefined();
  });

  it("mudanca de academia na revalidacao do mesmo UID remove cache privado", async () => {
    mocks.fetch.mockResolvedValue(profile("A"));
    await emit("uid-a");
    await waitFor(() => expect(auth.academia?.id).toBe(1));
    client.setQueryData(["aluno", "faturas"], ["tenant antigo"]);
    mocks.fetch.mockResolvedValue(profile("A", "ALUNO", 2));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ["auth", "me"] });
    });
    await waitFor(() => expect(auth.academia?.id).toBe(2));
    expect(client.getQueryData(["aluno", "faturas"])).toBeUndefined();
  });
});
