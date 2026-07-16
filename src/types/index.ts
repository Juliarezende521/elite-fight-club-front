export type Role = "ALUNO" | "PROFESSOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
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

export interface Professor {
  id: string;
  name: string;
  email: string;
  modalityIds: string[];
  active: boolean;
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

export interface WeightRecord {
  id: string;
  studentId: string;
  date: string;
  weight: number;
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
