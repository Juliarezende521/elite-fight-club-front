import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DemoOnlyContent } from "./DemoOnlyContent";
const state = vi.hoisted(() => ({ enabled: false, demo: false }));
vi.mock("@/lib/auth/context", () => ({ useAuth: () => ({ isDemoSession: state.demo }) }));
vi.mock("@/lib/env", () => ({
  appEnv: {
    get enableDemoMode() {
      return state.enabled;
    },
  },
}));
afterEach(cleanup);
it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])("mock somente com flag %s e sessao demo %s", (enabled, demo) => {
  state.enabled = enabled;
  state.demo = demo;
  render(
    <DemoOnlyContent>
      <div>Dados ficticios</div>
    </DemoOnlyContent>,
  );
  expect(Boolean(screen.queryByText("Dados ficticios"))).toBe(enabled && demo);
});
