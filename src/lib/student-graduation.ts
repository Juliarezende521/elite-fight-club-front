import { http } from "@/lib/api";

export interface StudentGraduationSummary {
  graduacaoAtual: string | null;
  proximaGraduacao: string | null;
  checkInsAtuais: number;
  checkInsRestantes: number;
  diasNaGraduacaoAtual: number;
  dataEntradaGraduacaoAtual: string | null;
  dataUltimaPromocao: string | null;
  historico: unknown[];
  certificados: unknown[];
}

export interface StudentGraduationEvent {
  eventoId: number;
  titulo: string;
  descricao: string | null;
  data: string;
  horaInicio: string | null;
  horaFim: string | null;
  local: string | null;
  fimInscricoes: string | null;
  graduacaoAtual: string | null;
  proximaGraduacao: string | null;
  checkInsAtuais: number;
  checkInsNecessarios: number;
  elegivel: boolean;
  valor: number;
  statusConvite: string | null;
  statusInscricao: string | null;
}

export function fetchStudentGraduations() {
  return http.get<StudentGraduationSummary>("/api/alunos/me/graduacoes");
}

export function fetchStudentGraduationEvents() {
  return http.get<StudentGraduationEvent[]>("/api/alunos/me/eventos-graduacao");
}
