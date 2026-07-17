export type Role = "ALUNO" | "PROFESSOR" | "ADMIN";

export interface Academia {
  id: string;
  nome: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface AuthenticatedUser extends User {
  academia?: Academia;
}

export interface ApiModalidade {
  id: number;
  nome: string;
  descricao?: string;
  corHex?: string;
  icone?: string;
  ativa: boolean;
}

export interface Modality {
  id: string;
  name: string;
  colorToken: "info" | "success" | "warning" | "destructive" | "primary";
  icon?: string;
  description?: string;
  active: boolean;
  studentsCount: number;
  weeklyClasses: number;
}

export interface Prajied {
  id: string;
  name: string;
  colorHex: string;
  order: number;
  minCheckIns: number;
  minMonths: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  status: "ativo" | "inativo";
  modalityIds: string[];
  prajiedId: string;
  nextPrajiedId?: string;
  checkInsMonth: number;
  checkInsTotal: number;
  requiredCheckIns: number;
  streak: number;
  financialStatus: "em_dia" | "pendente" | "atrasado";
  preferredPayment: "pix" | "pix_auto" | "cartao" | "boleto" | "dinheiro";
  weightCurrent?: number;
  weightGoal?: number;
}

export type Aluno = Student;

export interface Professor {
  id: string;
  name: string;
  email: string;
  modalityIds: string[];
  active: boolean;
}

export interface Plano {
  id: string;
  tipo: "TURMA" | "PERSONAL";
  quantidadeAulasSemana: number;
  valor: number;
  ativo: boolean;
}

export interface ClassSchedule {
  id: string;
  date: string;
  time: string;
  modalityId: string;
  professorId: string;
  type: "turma" | "personal";
  capacity: number;
  reserved: number;
  status: "aberta" | "lotada" | "cancelada" | "encerrada";
  studentId?: string;
}

export type Aula = ClassSchedule;

export interface Reservation {
  id: string;
  classId: string;
  studentId: string;
  status: "confirmada" | "cancelada" | "presente" | "ausente";
}

export interface CheckIn {
  id: string;
  studentId: string;
  classId?: string;
  date: string;
  status: "presente" | "ausente";
}

export interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: "em_dia" | "pendente" | "atrasado" | "pago";
  method?: Student["preferredPayment"];
}

export type Fatura = Invoice;

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: Student["preferredPayment"];
}

export interface GraduationEvent {
  id: string;
  date: string;
  modalityId: string;
  prajiedId: string;
  location: string;
  fee: number;
  status: "aberto" | "inscricoes_encerradas" | "realizado";
}

export interface Notification {
  id: string;
  category:
    | "financeiro"
    | "aula"
    | "checkin"
    | "graduacao"
    | "pagamento"
    | "certificado"
    | "sistema";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export type Notificacao = Notification;

export interface WeightRecord {
  id: string;
  studentId: string;
  date: string;
  weight: number;
}

export type EvolucaoPeso = WeightRecord;

export interface MetaPeso {
  id: string;
  studentId: string;
  targetWeight: number;
  active: boolean;
}

export interface BodyAssessment {
  id: string;
  studentId: string;
  date: string;
  height: number;
  weight: number;
  bodyFatPct?: number;
  musclePct?: number;
  measurements?: Record<string, number>;
}

export type AvaliacaoCorporal = BodyAssessment;
