import { api, http } from "@/lib/api";

export type StatusFatura = "PENDENTE" | "PARCIALMENTE_PAGA" | "VENCIDA" | "PAGA" | "CANCELADA";

export interface StudentInvoice {
  id: number;
  mesReferencia: string;
  dataVencimento: string;
  valor: number | string;
  status: StatusFatura | string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface StudentPaymentPreference {
  id: number;
  alunoId: number;
  alunoNome: string;
  formaPreferida: string;
  statusAutorizacao: string;
  pagamentoAutomaticoAtivo: boolean;
  provedor?: string | null;
  descricaoMascarada?: string | null;
  ativa: boolean;
  criadaEm?: string;
  atualizadaEm?: string;
}

export async function fetchStudentInvoices(alunoId: number) {
  return http.get<StudentInvoice[]>(`/api/faturas/aluno/${alunoId}`);
}

export async function fetchStudentPaymentPreference() {
  const response = await api.get<StudentPaymentPreference | "">(
    "/api/alunos/me/preferencia-pagamento",
  );
  return response.status === 204 || !response.data ? null : response.data;
}
