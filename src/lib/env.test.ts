import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it.each(["", "false", "true"])(
  "demo em DEV depende somente da flag explicita: %s",
  async (flag) => {
    vi.resetModules();
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_ENABLE_DEMO_MODE", flag);
    const { appEnv } = await import("./env");
    expect(appEnv.enableDemoMode).toBe(flag === "true");
  },
);
