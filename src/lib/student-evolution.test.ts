import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { api, ApiError } from "@/lib/api";
import {
  listStudentWeights,
  fetchStudentWeightSummary,
  createStudentWeight,
  updateStudentWeight,
  deleteStudentWeight,
  chronologicalWeights,
  validateWeight,
  formatWeightDate,
  weightErrorMessage,
  type StudentWeightRecord,
} from "./student-evolution";

vi.mock("@/lib/auth/service", () => ({ getAuthorizationToken: async () => "synthetic-token" }));
const adapter = vi.fn();
const originalAdapter = api.defaults.adapter;
beforeEach(() => {
  adapter.mockReset();
  adapter.mockImplementation(async (config) => ({
    data: [],
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  }));
  api.defaults.adapter = adapter;
});
afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

it("usa endpoints reais e Bearer sem enviar identificador de aluno", async () => {
  const payload = { peso: 91.25, dataRegistro: "2026-01-15", observacao: "Teste sintetico" };
  await listStudentWeights();
  await fetchStudentWeightSummary();
  await createStudentWeight(payload);
  await updateStudentWeight(7, payload);
  await deleteStudentWeight(7);
  const configs = adapter.mock.calls.map(([config]) => config);
  expect(configs.map((c) => [c.method, c.url])).toEqual([
    ["get", "/api/alunos/me/pesos"],
    ["get", "/api/alunos/me/pesos/resumo"],
    ["post", "/api/alunos/me/pesos"],
    ["put", "/api/alunos/me/pesos/7"],
    ["delete", "/api/alunos/me/pesos/7"],
  ]);
  expect(configs.every((c) => c.headers.Authorization === "Bearer synthetic-token")).toBe(true);
  expect(JSON.parse(configs[2].data)).toEqual(payload);
  expect(JSON.parse(configs[3].data)).toEqual(payload);
});

it("propaga indisponibilidade em vez de devolver lista vazia", async () => {
  adapter.mockRejectedValueOnce(new Error("network"));
  await expect(listStudentWeights()).rejects.toBeInstanceOf(ApiError);
});

it("ordena datas completas entre anos sem alterar a lista original", () => {
  const data = [
    { id: 3, dataRegistro: "2026-01-01" },
    { id: 1, dataRegistro: "2025-12-31" },
    { id: 2, dataRegistro: "2025-01-01" },
  ] as StudentWeightRecord[];
  expect(chronologicalWeights(data).map((x) => x.id)).toEqual([2, 1, 3]);
  expect(data[0].id).toBe(3);
});

it.each(["", "0", "-1", "500.01", "Infinity", "abc"])("rejeita peso invalido %s", (peso) => {
  expect(validateWeight(peso, "2026-01-01", "", "2026-01-01").errors.peso).toBeTruthy();
});
it.each(["0,01", "500", "91,25"])("aceita decimal e limites %s", (peso) => {
  expect(validateWeight(peso, "2026-01-01", "", "2026-01-01").errors).toEqual({});
});
it("rejeita data futura ou inexistente", () => {
  expect(validateWeight("90", "2026-01-02", "", "2026-01-01").errors.dataRegistro).toBeTruthy();
  expect(validateWeight("90", "2026-02-30", "", "2026-03-01").errors.dataRegistro).toBeTruthy();
});
it("normaliza virgula e observacao vazia", () => {
  expect(validateWeight("91,25", "2026-01-01", "  ", "2026-01-01").payload).toEqual({
    peso: 91.25,
    dataRegistro: "2026-01-01",
    observacao: null,
  });
});
it("limita observacao ao tamanho da coluna existente", () => {
  expect(validateWeight("90", "2026-01-01", "a".repeat(1001)).errors.observacao).toBeTruthy();
});
it("exibe data civil sem alterar o dia", () => {
  expect(formatWeightDate("2026-01-01")).toBe("01/01/2026");
});
it.each([400, 401, 403, 404, 409])("erro %s nao expoe detalhes internos", (status) => {
  const message = weightErrorMessage(new ApiError({ status, message: "SQL segredo interno" }));
  expect(message).not.toContain("SQL");
  expect(message).not.toContain("segredo");
});
