import { http } from "@/lib/api";

export interface StudentDashboardResponse {
  alunoId: number;
  nome: string;
  ativo: boolean;
  prajied: StudentPrajiedSummary | null;
  checkIns: StudentCheckInsSummary | null;
  plano: StudentPlanSummary | null;
  financeiro: StudentFinancialSummary | null;
  preferenciaPagamento: StudentPaymentPreference | null;
  evolucaoPeso: StudentWeightSummary | null;
  metaPeso: StudentWeightGoalSummary | null;
  proximaAula: StudentClassSummary | null;
  aulasHoje: StudentClassSummary[];
  aulasSemana: StudentClassSummary[];
  horariosFixosPersonal: StudentPersonalScheduleSummary[];
}

export interface StudentPrajiedSummary {
  prajiedId: number;
  nome: string;
  corHex: string | null;
  ordem: number;
  checkInsAtuais: number;
  checkInsNecessariosProximaGraduacao: number;
  checkInsFaltantes: number;
  proximoPrajiedId: number | null;
  proximoPrajiedNome: string | null;
  percentualProgresso: number;
  elegivelParaAvaliacao: boolean;
  tempoMinimoMeses: number;
  motivo: string | null;
}

export interface StudentCheckInsSummary {
  total: number;
  noMesAtual: number;
  naSemanaAtual: number;
  ultimoCheckInEm: string | null;
}

export interface StudentPlanSummary {
  planoId: number;
  nome: string;
  tipo: "TURMA" | "PERSONAL" | string;
  aulasPorSemana: number;
  valor: number;
  ativo: boolean;
  reservasConfirmadasNaSemana: number;
  aulasRestantesNaSemana: number;
}

export interface StudentFinancialSummary {
  emDia: boolean;
  faturaAtualId: number | null;
  mesReferencia: string | null;
  vencimento: string | null;
  valorTotal: number;
  valorPago: number;
  saldo: number;
  status: string;
  possuiPixPendente: boolean;
  pagamentoPixId: number | null;
  pixExpiraEm: string | null;
}

export interface StudentPaymentPreference {
  formaPreferida: string | null;
  statusAutorizacao: string | null;
  pagamentoAutomaticoAtivo: boolean;
  descricaoMascarada: string | null;
}

export interface StudentWeightSummary {
  pesoAtual: number | null;
  dataPesoAtual: string | null;
  diferencaPeso: number | null;
  menorPeso: number | null;
  maiorPeso: number | null;
  totalRegistros: number;
}

export interface StudentWeightGoalSummary {
  metaId: number | null;
  pesoAtual: number | null;
  pesoAlvo: number | null;
  quantidadeRestante: number | null;
  percentualProgresso: number | null;
  direcao: string | null;
  metaAtingida: boolean;
  status: string | null;
}

export interface StudentClassSummary {
  aulaId: number;
  tipo: "TURMA" | "PERSONAL" | string;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: string;
  modalidade: string | null;
  professorNome: string;
  reservada: boolean;
  checkInRealizado: boolean;
  statusPresenca: string | null;
  sessaoCheckInAberta?: boolean;
}

export interface StudentPersonalScheduleSummary {
  agendaPersonalId: number;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  professorNome: string;
  dataInicio: string;
  ativo: boolean;
}

export interface StudentCheckInHistoryResponse {
  alunoId: number;
  total: number;
  checkIns: StudentCheckInRecord[];
}

export interface StudentCheckInRecord {
  id: number;
  alunoId: number;
  alunoNome: string;
  aulaTurmaId: number | null;
  aulaPersonalId: number | null;
  realizadoEm: string;
  origem: string;
  confirmadoPor: string | null;
}

export function fetchStudentDashboard() {
  return http.get<StudentDashboardResponse>("/api/alunos/me/dashboard");
}

export function fetchStudentCheckIns(inicio: string, fim: string) {
  return http.get<StudentCheckInHistoryResponse>("/api/alunos/me/check-ins", {
    params: { inicio, fim },
  });
}

export function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLastDaysRange(days: number) {
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(fim.getDate() - Math.max(0, days - 1));

  return {
    inicio: formatLocalDate(inicio),
    fim: formatLocalDate(fim),
  };
}

export function calculateCurrentStreak(checkIns: StudentCheckInRecord[]) {
  const checkedDates = new Set(checkIns.map((checkIn) => checkIn.realizadoEm.slice(0, 10)));
  const cursor = new Date();
  let streak = 0;

  while (checkedDates.has(formatLocalDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
