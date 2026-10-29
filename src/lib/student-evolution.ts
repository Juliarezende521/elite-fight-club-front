import { ApiError, http } from "@/lib/api";
import { formatLocalDate } from "@/lib/student-dashboard";

export interface StudentWeightRecord {
  id: number;
  alunoId: number;
  alunoNome: string;
  peso: number;
  dataRegistro: string;
  observacao: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface StudentWeightSummary {
  pesoInicial: number | null;
  dataPesoInicial: string | null;
  pesoAtual: number | null;
  dataPesoAtual: string | null;
  diferencaPeso: number | null;
  menorPeso: number | null;
  maiorPeso: number | null;
  totalRegistros: number;
}

export interface WeightPayload {
  peso: number;
  dataRegistro: string;
  observacao: string | null;
}

const resource = "/api/alunos/me/pesos";
export const listStudentWeights = () => http.get<StudentWeightRecord[]>(resource);
export const fetchStudentWeightSummary = () => http.get<StudentWeightSummary>(resource + "/resumo");
export const createStudentWeight = (payload: WeightPayload) =>
  http.post<StudentWeightRecord, WeightPayload>(resource, payload);
export const updateStudentWeight = (id: number, payload: WeightPayload) =>
  http.put<StudentWeightRecord, WeightPayload>(`${resource}/${id}`, payload);
export const deleteStudentWeight = (id: number) => http.delete<void>(`${resource}/${id}`);

export function validateWeight(
  peso: string,
  dataRegistro: string,
  observacao: string,
  today = formatLocalDate(new Date()),
) {
  const errors: Partial<Record<keyof WeightPayload, string>> = {};
  const numeric = Number(peso.trim().replace(",", "."));
  if (!peso.trim() || !Number.isFinite(numeric) || numeric < 0.01 || numeric > 500) {
    errors.peso = "Informe um peso entre 0,01 e 500 kg.";
  }
  const parsed = new Date(`${dataRegistro}T12:00:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dataRegistro) ||
    Number.isNaN(parsed.getTime()) ||
    formatLocalDate(parsed) !== dataRegistro
  ) {
    errors.dataRegistro = "Informe uma data válida.";
  } else if (dataRegistro > today) {
    errors.dataRegistro = "A data não pode ser futura.";
  }
  if (observacao.length > 1000) errors.observacao = "Use até 1.000 caracteres.";
  return {
    errors,
    payload: { peso: numeric, dataRegistro, observacao: observacao.trim() || null },
  };
}

export function chronologicalWeights(records: StudentWeightRecord[]) {
  return [...records].sort((a, b) => a.dataRegistro.localeCompare(b.dataRegistro) || a.id - b.id);
}

export function formatWeight(value: number | null) {
  return value == null
    ? "Não informado"
    : `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
}

export function formatWeightDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function weightErrorMessage(error: unknown) {
  const status = error instanceof ApiError ? error.status : undefined;
  if (status === 400) return "Confira o peso, a data e a observação informados.";
  if (status === 409)
    return "Já existe um registro nessa data. Edite o registro existente ou escolha outra data.";
  if (status === 401) return "Sua sessão expirou. Entre novamente.";
  if (status === 403) return "Você não tem permissão para acessar ou alterar este registro.";
  if (status === 404) return "Registro não encontrado. Atualize o histórico.";
  return "Não foi possível conectar ao serviço de peso. Tente novamente.";
}
