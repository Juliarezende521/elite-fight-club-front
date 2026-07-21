import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, ErrorStateBox, LoadingState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/queryKeys";
import {
  fetchStudentNotifications,
  markAllStudentNotificationsAsRead,
  markStudentNotificationAsRead,
} from "@/lib/student-notifications";

export const Route = createFileRoute("/aluno/notificacoes")({
  component: Notificacoes,
});

function Notificacoes() {
  const queryClient = useQueryClient();
  const [onlyUnread, setOnlyUnread] = useState(false);

  const notificationsQuery = useQuery({
    queryKey: [...queryKeys.notificacoes, "aluno", onlyUnread],
    queryFn: () => fetchStudentNotifications(onlyUnread),
  });

  const notifications = notificationsQuery.data ?? [];
  const hasUnread = notifications.some((notification) => !notification.lida);

  const markOneMutation = useMutation({
    mutationFn: markStudentNotificationAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notificacoes });
    },
    onError: () => toast.error("Não foi possível marcar a notificação como lida."),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllStudentNotificationsAsRead,
    onSuccess: async () => {
      toast.success("Notificações marcadas como lidas.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.notificacoes });
    },
    onError: () => toast.error("Não foi possível marcar todas como lidas."),
  });

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Notificações" }]}
        title="Notificações"
        subtitle="Avisos reais da sua academia."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setOnlyUnread((value) => !value)}>
              {onlyUnread ? "Ver todas" : "Só não lidas"}
            </Button>
            <Button
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={!hasUnread || markAllMutation.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          </>
        }
      />

      <SectionCard>
        {notificationsQuery.isLoading ? (
          <LoadingState label="Carregando notificações..." />
        ) : notificationsQuery.isError ? (
          <div className="space-y-3">
            <ErrorStateBox message="Não foi possível carregar suas notificações agora." />
            <Button variant="outline" size="sm" onClick={() => void notificationsQuery.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-5 w-5" />}
            title="Nenhuma notificação no momento"
            description={
              onlyUnread
                ? "Você não possui notificações não lidas."
                : "Quando houver avisos reais, eles aparecerão aqui."
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex gap-3 py-3">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-muted-foreground">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {notification.titulo}
                    </span>
                    {!notification.lida && (
                      <StatusBadge tone="info" dot={false}>
                        Nova
                      </StatusBadge>
                    )}
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {tipoLabel(notification.tipo)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.mensagem}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="whitespace-nowrap text-[11px] text-muted-foreground">
                    {dateTimeLabel(notification.criadaEm)}
                  </div>
                  {!notification.lida && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markOneMutation.mutate(notification.id)}
                      disabled={markOneMutation.isPending}
                    >
                      Marcar lida
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}

function tipoLabel(tipo: string) {
  return tipo.replaceAll("_", " ").toLowerCase();
}

function dateTimeLabel(value?: string | null) {
  if (!value) return "Sem data";
  return new Date(value).toLocaleDateString("pt-BR");
}
