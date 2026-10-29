import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ enabled: false, token: null as string | null }));
vi.mock("@/lib/env", () => ({
  appEnv: {
    get enableDemoMode() {
      return state.enabled;
    },
  },
}));
vi.mock("@/lib/firebase", () => ({
  getFirebaseAuth: () =>
    state.token ? { currentUser: { getIdToken: async () => state.token } } : null,
}));
vi.mock("@/lib/api", () => ({ http: { get: vi.fn() } }));
import { getAuthorizationToken, getDemoSession } from "./service";

beforeEach(() => {
  state.enabled = false;
  state.token = null;
  localStorage.clear();
  localStorage.setItem(
    "efc.session",
    JSON.stringify({
      source: "demo",
      token: "mock-firebase-token",
      user: { id: "1", name: "Teste", email: "test@example.invalid", role: "ADMIN" },
    }),
  );
});
it("token demo residual e ignorado com flag false", async () => {
  expect(getDemoSession()).toBeNull();
  expect(await getAuthorizationToken()).toBeNull();
});
it("demo exige flag true explicita", async () => {
  state.enabled = true;
  expect(await getAuthorizationToken()).toBe("mock-firebase-token");
});
it("token real tem prioridade sobre demo", async () => {
  state.enabled = true;
  state.token = "synthetic-real-token";
  expect(await getAuthorizationToken()).toBe("synthetic-real-token");
});
