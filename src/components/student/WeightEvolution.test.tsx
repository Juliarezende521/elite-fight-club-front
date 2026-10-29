import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { WeightEvolution } from "./WeightEvolution";
import { EvolutionPage } from "@/routes/aluno.evolucao";
import type { StudentWeightRecord } from "@/lib/student-evolution";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  summary: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  env: { enableDemoMode: false },
  auth: {
    firebaseUser: { uid: "uid-test" },
    isDemoSession: false,
    authenticatedUser: { perfil: "ALUNO", ativo: true, academia: { id: 2 }, alunoId: 4 },
  },
}));
vi.mock("@/lib/auth/context", () => ({ useAuth: () => mocks.auth }));
vi.mock("@/lib/env", () => ({ appEnv: mocks.env }));
vi.mock("@/lib/student-evolution", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/student-evolution")>()),
  listStudentWeights: mocks.list,
  fetchStudentWeightSummary: mocks.summary,
  createStudentWeight: mocks.create,
  updateStudentWeight: mocks.update,
  deleteStudentWeight: mocks.remove,
}));
vi.mock("./WeightChart", () => ({
  WeightChart: ({ records }: { records: unknown[] }) => (
    <div data-testid="weight-chart">{JSON.stringify(records)}</div>
  ),
}));

const record: StudentWeightRecord = {
  id: 7,
  alunoId: 4,
  alunoNome: "Aluno Teste",
  peso: 91.25,
  dataRegistro: "2025-12-31",
  observacao: "Registro sintetico",
  criadoEm: "2025-12-31T12:00:00",
  atualizadoEm: null,
};
const summary = {
  pesoInicial: 91.25,
  dataPesoInicial: "2025-12-31",
  pesoAtual: 90.5,
  dataPesoAtual: "2026-01-02",
  diferencaPeso: -0.75,
  menorPeso: 90.5,
  maiorPeso: 91.25,
  totalRegistros: 2,
};
let client: QueryClient;
beforeEach(() => {
  vi.resetAllMocks();
  mocks.env.enableDemoMode = false;
  mocks.auth.isDemoSession = false;
  mocks.auth.firebaseUser.uid = "uid-test";
  mocks.auth.authenticatedUser.academia.id = 2;
  mocks.list.mockResolvedValue([
    record,
    { ...record, id: 8, peso: 90.5, dataRegistro: "2026-01-02" },
  ]);
  mocks.summary.mockResolvedValue(summary);
  mocks.create.mockResolvedValue(record);
  mocks.update.mockResolvedValue(record);
  mocks.remove.mockResolvedValue(undefined);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});
afterEach(() => {
  cleanup();
  client.clear();
});
function mount(page = false) {
  return render(
    <QueryClientProvider client={client}>
      {page ? <EvolutionPage /> : <WeightEvolution />}
    </QueryClientProvider>,
  );
}
async function ready() {
  await screen.findByRole("heading", { name: "Histórico de peso" });
}
async function openCreate() {
  fireEvent.click(screen.getByRole("button", { name: "Registrar peso" }));
  const dialog = await screen.findByRole("dialog");
  return within(dialog);
}

it("mostra carregamento sem fabricar zero", () => {
  mocks.list.mockReturnValue(new Promise(() => {}));
  mocks.summary.mockReturnValue(new Promise(() => {}));
  mount();
  expect(screen.getByText("Carregando evolução do peso...")).toBeTruthy();
  expect(screen.queryByText("Nenhum peso registrado")).toBeNull();
});
it.each([400, 401, 403, 409, undefined])(
  "erro %s oferece retry sem mocks ou vazio",
  async (status) => {
    mocks.list.mockRejectedValue(new ApiError({ status, message: "interno" }));
    mount();
    await screen.findByRole("button", { name: "Tentar novamente" });
    expect(screen.queryByText("Nenhum peso registrado")).toBeNull();
    expect(screen.queryByTestId("weight-chart")).toBeNull();
    expect(screen.queryByText("interno")).toBeNull();
    mocks.list.mockResolvedValue([record]);
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await ready();
  },
);
it("falha do resumo nao vira peso zero mesmo com historico carregado", async () => {
  mocks.summary.mockRejectedValue(new Error("rede"));
  mount();
  await screen.findByRole("button", { name: "Tentar novamente" });
  expect(screen.queryByTestId("weight-chart")).toBeNull();
  expect(screen.queryByText("0,00 kg")).toBeNull();
});
it("mostra estado vazio real", async () => {
  mocks.list.mockResolvedValue([]);
  mocks.summary.mockResolvedValue({ ...summary, pesoAtual: null, totalRegistros: 0 });
  mount();
  await screen.findByText("Nenhum peso registrado");
  expect(screen.queryByTestId("weight-chart")).toBeNull();
});
it("carrega resumo do backend e ordena grafico pela data inteira", async () => {
  mocks.list.mockResolvedValue([
    { ...record, id: 8, peso: 90.5, dataRegistro: "2026-01-02" },
    record,
  ]);
  mount();
  await ready();
  expect(screen.getByText("-0,75 kg")).toBeTruthy();
  expect(screen.getByText("Peso inicial").nextSibling?.textContent).toBe("91,25 kg");
  expect(screen.getByText("Registros").nextSibling?.textContent).toBe("2");
  const chart = JSON.parse(screen.getByTestId("weight-chart").textContent!);
  expect(chart.map((r: StudentWeightRecord) => r.dataRegistro)).toEqual([
    "2025-12-31",
    "2026-01-02",
  ]);
  expect(
    client.getQueryData([...queryKeys.alunoPesos("uid-test", 2, 4), "historico"]),
  ).toBeTruthy();
});
it("um unico registro alimenta grafico", async () => {
  mocks.list.mockResolvedValue([record]);
  mount();
  await ready();
  expect(JSON.parse(screen.getByTestId("weight-chart").textContent!)).toHaveLength(1);
});
it("cadastro envia numero e atualiza historico resumo e dashboard", async () => {
  mount();
  await ready();
  const invalidation = vi.spyOn(client, "invalidateQueries");
  const form = await openCreate();
  fireEvent.change(form.getByLabelText("Peso (kg)"), { target: { value: "92,35" } });
  fireEvent.change(form.getByLabelText("Data"), { target: { value: "2026-01-03" } });
  fireEvent.change(form.getByLabelText("Observação (opcional)"), {
    target: { value: "Novo registro sintetico" },
  });
  fireEvent.click(form.getByRole("button", { name: "Salvar registro" }));
  await waitFor(() =>
    expect(mocks.create).toHaveBeenCalledWith({
      peso: 92.35,
      dataRegistro: "2026-01-03",
      observacao: "Novo registro sintetico",
    }),
  );
  await screen.findByText("Registro salvo.");
  expect(mocks.list.mock.calls.length).toBeGreaterThan(1);
  expect(mocks.summary.mock.calls.length).toBeGreaterThan(1);
  expect(invalidation).toHaveBeenCalledWith({ queryKey: queryKeys.alunoDashboard });
});
it("peso invalido nao envia requisicao", async () => {
  mount();
  await ready();
  const form = await openCreate();
  fireEvent.change(form.getByLabelText("Peso (kg)"), { target: { value: "501" } });
  fireEvent.click(form.getByRole("button", { name: "Salvar registro" }));
  expect(await screen.findByText("Informe um peso entre 0,01 e 500 kg.")).toBeTruthy();
  expect(mocks.create).not.toHaveBeenCalled();
});
it("data futura nao envia requisicao", async () => {
  mount();
  await ready();
  const form = await openCreate();
  fireEvent.change(form.getByLabelText("Peso (kg)"), { target: { value: "90" } });
  fireEvent.change(form.getByLabelText("Data"), { target: { value: "2999-01-01" } });
  fireEvent.click(form.getByRole("button", { name: "Salvar registro" }));
  expect(await screen.findByText("A data não pode ser futura.")).toBeTruthy();
  expect(mocks.create).not.toHaveBeenCalled();
});
it("409 mantem formulario e valores para correcao", async () => {
  mocks.create.mockRejectedValue(new ApiError({ status: 409, message: "SQL interno" }));
  mount();
  await ready();
  const form = await openCreate();
  fireEvent.change(form.getByLabelText("Peso (kg)"), { target: { value: "90" } });
  fireEvent.click(form.getByRole("button", { name: "Salvar registro" }));
  await screen.findByText(/Já existe um registro nessa data/);
  expect((form.getByLabelText("Peso (kg)") as HTMLInputElement).value).toBe("90");
  expect(screen.queryByText("SQL interno")).toBeNull();
});
it("edicao preenche campos e envia payload completo", async () => {
  mount();
  await ready();
  fireEvent.click(screen.getByRole("button", { name: "Editar registro de 31/12/2025" }));
  const dialog = within(await screen.findByRole("dialog"));
  expect((dialog.getByLabelText("Peso (kg)") as HTMLInputElement).value).toBe("91,25");
  expect((dialog.getByLabelText("Data") as HTMLInputElement).value).toBe("2025-12-31");
  fireEvent.change(dialog.getByLabelText("Peso (kg)"), { target: { value: "91,5" } });
  fireEvent.click(dialog.getByRole("button", { name: "Salvar registro" }));
  await screen.findByText("Registro salvo.");
  expect(mocks.update).toHaveBeenCalledWith(7, {
    peso: 91.5,
    dataRegistro: "2025-12-31",
    observacao: "Registro sintetico",
  });
  expect(mocks.list.mock.calls.length).toBeGreaterThan(1);
  expect(mocks.summary.mock.calls.length).toBeGreaterThan(1);
});
it("exclusao exige confirmacao e atualiza queries", async () => {
  mount();
  await ready();
  fireEvent.click(screen.getByRole("button", { name: "Excluir registro de 31/12/2025" }));
  const dialog = within(await screen.findByRole("alertdialog"));
  expect(mocks.remove).not.toHaveBeenCalled();
  fireEvent.click(dialog.getByRole("button", { name: "Confirmar exclusão" }));
  await screen.findByText("Registro excluído.");
  expect(mocks.remove.mock.calls[0][0]).toBe(7);
  expect(mocks.list.mock.calls.length).toBeGreaterThan(1);
  expect(mocks.summary.mock.calls.length).toBeGreaterThan(1);
});
it("envio pendente bloqueia duplicacao e fechamento", async () => {
  let resolve!: (value: StudentWeightRecord) => void;
  mocks.create.mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  mount();
  await ready();
  const form = await openCreate();
  fireEvent.change(form.getByLabelText("Peso (kg)"), { target: { value: "90" } });
  fireEvent.click(form.getByRole("button", { name: "Salvar registro" }));
  const saving = await screen.findByRole("button", { name: "Salvando..." });
  expect((saving as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(saving);
  expect(mocks.create).toHaveBeenCalledTimes(1);
  await act(async () => {
    resolve(record);
  });
  await screen.findByText("Registro salvo.");
});
it("sessao real nao usa apresentacao ficticia e outras abas sao pendentes", async () => {
  mount(true);
  await ready();
  expect(screen.queryByText(/Demonstração/)).toBeNull();
  const tab = screen.getByRole("tab", { name: "Meta" });
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
  fireEvent.click(tab);
  await screen.findByText("Meta de peso em desenvolvimento");
});
it("demo explicito preserva apresentacao e nao chama API", async () => {
  mocks.env.enableDemoMode = true;
  mocks.auth.isDemoSession = true;
  mount(true);
  await screen.findByText("Demonstração · dados fictícios");
  expect(screen.getByTestId("weight-chart")).toBeTruthy();
  expect(mocks.list).not.toHaveBeenCalled();
  expect(mocks.summary).not.toHaveBeenCalled();
});
it("flag false impede mock mesmo com marcador demo residual", async () => {
  mocks.auth.isDemoSession = true;
  mount(true);
  expect(screen.queryByText(/Demonstração/)).toBeNull();
  expect(screen.queryByTestId("weight-chart")).toBeNull();
});

it("troca de UID e academia nao reutiliza historico anterior", async () => {
  const view = mount();
  await ready();
  mocks.list.mockReturnValue(new Promise(() => {}));
  mocks.summary.mockReturnValue(new Promise(() => {}));
  mocks.auth.firebaseUser.uid = "uid-outro";
  mocks.auth.authenticatedUser.academia.id = 3;
  view.rerender(
    <QueryClientProvider client={client}>
      <WeightEvolution />
    </QueryClientProvider>,
  );
  await screen.findByText("Carregando evolução do peso...");
  expect(screen.queryByText("Registro sintetico")).toBeNull();
  expect(screen.queryByTestId("weight-chart")).toBeNull();
});

it("exclusao pendente bloqueia duplicacao e mantem erro recuperavel", async () => {
  let reject!: (reason: unknown) => void;
  mocks.remove.mockReturnValue(
    new Promise((_, fail) => {
      reject = fail;
    }),
  );
  mount();
  await ready();
  fireEvent.click(screen.getByRole("button", { name: "Excluir registro de 31/12/2025" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
  const button = await screen.findByRole("button", { name: "Excluindo..." });
  expect((button as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(button);
  expect(mocks.remove).toHaveBeenCalledTimes(1);
  await act(async () => {
    reject(new Error("network"));
  });
  await screen.findByText("Não foi possível conectar ao serviço de peso. Tente novamente.");
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  expect(screen.getAllByText("Registro sintetico").length).toBeGreaterThan(0);
});

it("cancelar exclusao nao altera o historico", async () => {
  mount();
  await ready();
  fireEvent.click(screen.getByRole("button", { name: "Excluir registro de 31/12/2025" }));
  fireEvent.click(
    within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancelar" }),
  );
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(mocks.remove).not.toHaveBeenCalled();
});
