import { http } from "@/lib/api";
import { appEnv } from "@/lib/env";
import { getDemoSession } from "@/lib/auth/service";

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

export async function fetchStudentDashboard() {
  if (isDemo()) return demoDashboard();
  return http.get<StudentDashboardResponse>("/api/alunos/me/dashboard");
}

export async function fetchStudentCheckIns(inicio: string, fim: string) {
  if (isDemo()) return demoCheckIns(inicio, fim);
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

function isDemo() {
  return appEnv.enableDemoMode && Boolean(getDemoSession());
}

function demoDashboard(): StudentDashboardResponse {
  const today = formatLocalDate(new Date());
  const aula = (id: number, h: string, f: string, mod: string): StudentClassSummary => ({
    aulaId: id, tipo: "TURMA", data: today, horaInicio: h, horaFim: f, status: "AGENDADA",
    modalidade: mod, professorNome: "Mestre Carlos", reservada: true, checkInRealizado: false,
    statusPresenca: null, sessaoCheckInAberta: false,
  });
  const aulas = [aula(1, "18:00", "19:00", "Muay Thai"), aula(2, "19:30", "20:30", "Jiu-Jitsu")];
  return {
    alunoId: 1, nome: "Rafael Moreira", ativo: true,
    prajied: { prajiedId: 2, nome: "Prajied Vermelho", corHex: "#dc2626", ordem: 2, checkInsAtuais: 38,
      checkInsNecessariosProximaGraduacao: 50, checkInsFaltantes: 12, proximoPrajiedId: 3,
      proximoPrajiedNome: "Prajied Azul", percentualProgresso: 76, elegivelParaAvaliacao: false,
      tempoMinimoMeses: 6, motivo: null },
    checkIns: { total: 124, noMesAtual: 11, naSemanaAtual: 3, ultimoCheckInEm: new Date().toISOString() },
    plano: { planoId: 1, nome: "Plano Pro", tipo: "TURMA", aulasPorSemana: 5, valor: 249.9, ativo: true,
      reservasConfirmadasNaSemana: 3, aulasRestantesNaSemana: 2 },
    financeiro: { emDia: true, faturaAtualId: 1, mesReferencia: today.slice(0, 7), vencimento: today,
      valorTotal: 249.9, valorPago: 249.9, saldo: 0, status: "PAGA", possuiPixPendente: false,
      pagamentoPixId: null, pixExpiraEm: null },
    preferenciaPagamento: { formaPreferida: "PIX", statusAutorizacao: null, pagamentoAutomaticoAtivo: false, descricaoMascarada: null },
    evolucaoPeso: { pesoAtual: 78.4, dataPesoAtual: today, diferencaPeso: -3.2, menorPeso: 78.4, maiorPeso: 82.1, totalRegistros: 8 },
    metaPeso: { metaId: 1, pesoAtual: 78.4, pesoAlvo: 75, quantidadeRestante: 3.4, percentualProgresso: 48, direcao: "PERDER", metaAtingida: false, status: "EM_ANDAMENTO" },
    proximaAula: aulas[0], aulasHoje: aulas, aulasSemana: aulas, horariosFixosPersonal: [],
  };
}

function demoCheckIns(inicio: string, fim: string): StudentCheckInHistoryResponse {
  const checkIns: StudentCheckInRecord[] = [];
  const cur = new Date(inicio + "T12:00:00");
  const end = new Date(fim + "T12:00:00");
  let id = 1;
  while (cur <= end) {
    if (cur.getDay() % 2 === 1 || cur.getDay() === 6) {
      checkIns.push({ id: id++, alunoId: 1, alunoNome: "Rafael Moreira", aulaTurmaId: 1, aulaPersonalId: null,
        realizadoEm: formatLocalDate(cur) + "T18:05:00", origem: "QR_CODE", confirmadoPor: null });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return { alunoId: 1, total: checkIns.length, checkIns };
}
