import type {
  ClassSchedule,
  GraduationEvent,
  Invoice,
  Modality,
  Notification,
  Prajied,
  Professor,
  Student,
  User,
  WeightRecord,
} from "@/types";

export const mockUsers: Record<string, User> = {
  aluno: {
    id: "u-1",
    name: "Rafael Moreira",
    email: "rafael@elitefc.com",
    role: "ALUNO",
  },
  professor: {
    id: "u-2",
    name: "Coach Bruno Salles",
    email: "bruno@elitefc.com",
    role: "PROFESSOR",
  },
  admin: {
    id: "u-3",
    name: "Marina Duarte",
    email: "marina@elitefc.com",
    role: "ADMIN",
  },
};

export const mockModalities: Modality[] = [
  { id: "m-1", name: "Muay Thai", colorToken: "destructive", active: true, studentsCount: 84, weeklyClasses: 12 },
  { id: "m-2", name: "Jiu-Jitsu", colorToken: "info", active: true, studentsCount: 112, weeklyClasses: 14 },
  { id: "m-3", name: "Boxe", colorToken: "warning", active: true, studentsCount: 61, weeklyClasses: 10 },
  { id: "m-4", name: "MMA", colorToken: "primary", active: true, studentsCount: 38, weeklyClasses: 6 },
  { id: "m-5", name: "Funcional", colorToken: "success", active: true, studentsCount: 47, weeklyClasses: 8 },
  { id: "m-6", name: "Kickboxing", colorToken: "destructive", active: false, studentsCount: 12, weeklyClasses: 2 },
];

export const mockPrajieds: Prajied[] = [
  { id: "p-1", name: "Branca", colorHex: "#F5F5F5", order: 1, minCheckIns: 0, minMonths: 0 },
  { id: "p-2", name: "Cinza", colorHex: "#8E8E93", order: 2, minCheckIns: 60, minMonths: 6 },
  { id: "p-3", name: "Azul", colorHex: "#3B82F6", order: 3, minCheckIns: 180, minMonths: 24 },
  { id: "p-4", name: "Roxa", colorHex: "#7C3AED", order: 4, minCheckIns: 360, minMonths: 48 },
  { id: "p-5", name: "Marrom", colorHex: "#78350F", order: 5, minCheckIns: 540, minMonths: 60 },
  { id: "p-6", name: "Preta", colorHex: "#111111", order: 6, minCheckIns: 720, minMonths: 72 },
];

export const mockCurrentStudent: Student = {
  id: "s-1",
  name: "Rafael Moreira",
  email: "rafael@elitefc.com",
  status: "ativo",
  modalityIds: ["m-1", "m-2"],
  prajiedId: "p-3",
  nextPrajiedId: "p-4",
  checkInsMonth: 14,
  checkInsTotal: 232,
  requiredCheckIns: 360,
  streak: 6,
  financialStatus: "em_dia",
  preferredPayment: "pix_auto",
  weightCurrent: 78.4,
  weightGoal: 75,
};

export const mockStudents: Student[] = [
  mockCurrentStudent,
  { id: "s-2", name: "Camila Rocha", email: "camila@elitefc.com", status: "ativo", modalityIds: ["m-2"], prajiedId: "p-2", checkInsMonth: 10, checkInsTotal: 88, requiredCheckIns: 180, streak: 3, financialStatus: "pendente", preferredPayment: "pix" },
  { id: "s-3", name: "Diego Alves", email: "diego@elitefc.com", status: "ativo", modalityIds: ["m-3", "m-4"], prajiedId: "p-4", checkInsMonth: 18, checkInsTotal: 410, requiredCheckIns: 540, streak: 12, financialStatus: "em_dia", preferredPayment: "cartao" },
  { id: "s-4", name: "Larissa Prado", email: "larissa@elitefc.com", status: "inativo", modalityIds: ["m-5"], prajiedId: "p-1", checkInsMonth: 0, checkInsTotal: 22, requiredCheckIns: 60, streak: 0, financialStatus: "atrasado", preferredPayment: "boleto" },
  { id: "s-5", name: "Thiago Bianchi", email: "thiago@elitefc.com", status: "ativo", modalityIds: ["m-1"], prajiedId: "p-3", checkInsMonth: 16, checkInsTotal: 205, requiredCheckIns: 360, streak: 8, financialStatus: "em_dia", preferredPayment: "pix_auto" },
];

export const mockProfessors: Professor[] = [
  { id: "pr-1", name: "Bruno Salles", email: "bruno@elitefc.com", modalityIds: ["m-1", "m-3"], active: true },
  { id: "pr-2", name: "Ana Yumi", email: "ana@elitefc.com", modalityIds: ["m-2"], active: true },
  { id: "pr-3", name: "Rogério Nunes", email: "rogerio@elitefc.com", modalityIds: ["m-4", "m-5"], active: true },
];

const today = new Date();
const iso = (offset: number, hour: number, min = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

export const mockClasses: ClassSchedule[] = [
  { id: "c-1", date: iso(0, 7), time: "07:00", modalityId: "m-2", professorId: "pr-2", type: "turma", capacity: 15, reserved: 8, status: "aberta" },
  { id: "c-2", date: iso(0, 12), time: "12:00", modalityId: "m-1", professorId: "pr-1", type: "turma", capacity: 20, reserved: 20, status: "lotada" },
  { id: "c-3", date: iso(0, 19), time: "19:00", modalityId: "m-3", professorId: "pr-1", type: "turma", capacity: 18, reserved: 12, status: "aberta" },
  { id: "c-4", date: iso(1, 6, 30), time: "06:30", modalityId: "m-5", professorId: "pr-3", type: "turma", capacity: 12, reserved: 9, status: "aberta" },
  { id: "c-5", date: iso(1, 20), time: "20:00", modalityId: "m-2", professorId: "pr-2", type: "personal", capacity: 1, reserved: 1, status: "lotada", studentId: "s-1" },
  { id: "c-6", date: iso(2, 18), time: "18:00", modalityId: "m-4", professorId: "pr-3", type: "turma", capacity: 16, reserved: 5, status: "aberta" },
  { id: "c-7", date: iso(3, 19), time: "19:00", modalityId: "m-1", professorId: "pr-1", type: "turma", capacity: 20, reserved: 14, status: "aberta" },
  { id: "c-8", date: iso(4, 8), time: "08:00", modalityId: "m-2", professorId: "pr-2", type: "turma", capacity: 15, reserved: 11, status: "aberta" },
];

export const mockInvoices: Invoice[] = [
  { id: "inv-1", studentId: "s-1", amount: 289.9, dueDate: iso(10, 12), status: "em_dia", method: "pix_auto" },
  { id: "inv-2", studentId: "s-2", amount: 249.0, dueDate: iso(-2, 12), status: "atrasado", method: "pix" },
  { id: "inv-3", studentId: "s-3", amount: 349.0, dueDate: iso(5, 12), status: "em_dia", method: "cartao" },
];

export const mockGraduationEvents: GraduationEvent[] = [
  { id: "g-1", date: iso(45, 15), modalityId: "m-2", prajiedId: "p-4", location: "Elite Fight Club — Unidade Central", fee: 180, status: "aberto" },
  { id: "g-2", date: iso(90, 15), modalityId: "m-1", prajiedId: "p-3", location: "Ginásio Norte", fee: 150, status: "aberto" },
];

export const mockNotifications: Notification[] = [
  { id: "n-1", category: "aula", title: "Aula confirmada", message: "Sua aula de Jiu-Jitsu hoje às 07:00 está confirmada.", date: iso(0, 6), read: false },
  { id: "n-2", category: "financeiro", title: "Mensalidade em dia", message: "Recebemos seu Pix Automático de R$ 289,90.", date: iso(-1, 10), read: false },
  { id: "n-3", category: "graduacao", title: "Você está elegível", message: "Elegibilidade confirmada para faixa Roxa em Jiu-Jitsu.", date: iso(-3, 9), read: true },
  { id: "n-4", category: "checkin", title: "Check-in registrado", message: "Check-in realizado ontem — streak de 6 dias.", date: iso(-1, 20), read: true },
  { id: "n-5", category: "sistema", title: "Nova política de reservas", message: "Reservas abrem com 48h de antecedência.", date: iso(-5, 8), read: true },
];

export const mockWeightHistory: WeightRecord[] = [
  { id: "w-1", studentId: "s-1", date: iso(-90, 8), weight: 82.1 },
  { id: "w-2", studentId: "s-1", date: iso(-60, 8), weight: 80.9 },
  { id: "w-3", studentId: "s-1", date: iso(-30, 8), weight: 79.6 },
  { id: "w-4", studentId: "s-1", date: iso(-14, 8), weight: 78.9 },
  { id: "w-5", studentId: "s-1", date: iso(0, 8), weight: 78.4 },
];

// 90-day heatmap (0..3 intensity)
export const mockCheckInHeatmap: { date: string; count: number }[] = Array.from({ length: 90 }).map((_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (89 - i));
  const dow = d.getDay();
  const count = dow === 0 ? 0 : Math.random() > 0.35 ? Math.ceil(Math.random() * 2) : 0;
  return { date: d.toISOString().slice(0, 10), count };
});

// Admin monthly revenue chart
export const mockMonthlyRevenue = [
  { month: "Jan", previsto: 42000, recebido: 39800 },
  { month: "Fev", previsto: 43500, recebido: 41200 },
  { month: "Mar", previsto: 45000, recebido: 43900 },
  { month: "Abr", previsto: 46200, recebido: 42800 },
  { month: "Mai", previsto: 47800, recebido: 46100 },
  { month: "Jun", previsto: 49000, recebido: 47500 },
  { month: "Jul", previsto: 50500, recebido: 48200 },
];

export const mockWeeklyCheckIns = [
  { day: "Seg", total: 92 },
  { day: "Ter", total: 108 },
  { day: "Qua", total: 121 },
  { day: "Qui", total: 115 },
  { day: "Sex", total: 132 },
  { day: "Sáb", total: 88 },
  { day: "Dom", total: 32 },
];

export function getModality(id: string): Modality | undefined {
  return mockModalities.find((m) => m.id === id);
}
export function getPrajied(id: string): Prajied | undefined {
  return mockPrajieds.find((p) => p.id === id);
}
export function getProfessor(id: string): Professor | undefined {
  return mockProfessors.find((p) => p.id === id);
}
