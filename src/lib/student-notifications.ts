import { http } from "@/lib/api";

export interface StudentNotification {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
}

export function fetchStudentNotifications(somenteNaoLidas: boolean) {
  return http.get<StudentNotification[]>("/api/alunos/me/notificacoes", {
    params: { somenteNaoLidas },
  });
}

export function markStudentNotificationAsRead(id: number) {
  return http.patch<StudentNotification>(`/api/alunos/me/notificacoes/${id}/lida`);
}

export function markAllStudentNotificationsAsRead() {
  return http.patch<void>("/api/alunos/me/notificacoes/marcar-todas-lidas");
}
