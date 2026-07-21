import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorStateBox, LoadingState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { queryKeys } from "@/lib/queryKeys";
import { fetchStudentDashboard } from "@/lib/student-dashboard";
import {
  fetchStudentGraduationEvents,
  fetchStudentGraduations,
  type StudentGraduationEvent,
} from "@/lib/student-graduation";

export const Route = createFileRoute("/aluno/graduacao")({
  component: Graduacao,
});

function Graduacao() {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.alunoDashboard,
    queryFn: fetchStudentDashboard,
  });
  const graduacaoQuery = useQuery({
    queryKey: queryKeys.alunoGraduacao,
    queryFn: fetchStudentGraduations,
  });
  const eventosQuery = useQuery({
    queryKey: queryKeys.alunoEventosGraduacao,
    queryFn: fetchStudentGraduationEvents,
  });

  const prajied = dashboardQuery.data?.prajied;
  const resumo = graduacaoQuery.data;
  const eventos = eventosQuery.data ?? [];
  const progress = Number(prajied?.percentualProgresso ?? 0);
  const currentCheckIns = prajied?.checkInsAtuais ?? resumo?.checkInsAtuais ?? 0;
  const requiredCheckIns = prajied?.checkInsNecessariosProximaGraduacao ?? 0;
  const nextGraduation = prajied?.proximoPrajiedNome ?? resumo?.proximaGraduacao ?? null;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Graduação" }]}
        title="Minha graduação"
        subtitle="Faixa atual, elegibilidade e eventos disponíveis."
      />

      {dashboardQuery.isLoading || graduacaoQuery.isLoading || eventosQuery.isLoading ? (
        <LoadingState label="Carregando graduação..." />
      ) : dashboardQuery.isError || graduacaoQuery.isError || eventosQuery.isError ? (
        <ErrorStateBox message="Não foi possível carregar sua graduação agora." />
      ) : !prajied && !resumo?.graduacaoAtual ? (
        <EmptyState
          title="Graduação inicial não configurada"
          description="Quando a graduação base da academia estiver configurada, ela aparecerá aqui."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard title="Faixa atual" className="lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className="h-16 w-16 shrink-0 rounded-md ring-2 ring-border"
                style={{ backgroundColor: prajied?.corHex ?? "var(--color-accent)" }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="font-display text-2xl text-foreground">
                  {prajied?.nome ?? resumo?.graduacaoAtual}
                </div>
                <div className="text-sm text-muted-foreground">
                  Próxima: <span className="text-foreground">{nextGraduation ?? "—"}</span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>
                      {currentCheckIns}/{requiredCheckIns}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
              <StatusBadge tone={prajied?.elegivelParaAvaliacao ? "success" : "info"}>
                {prajied?.elegivelParaAvaliacao ? "Elegível" : "Em progresso"}
              </StatusBadge>
            </div>
          </SectionCard>

          <SectionCard title="Requisitos">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">Check-ins mínimos</span>
                <span className="text-foreground">{requiredCheckIns || "—"}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">Check-ins faltantes</span>
                <span className="text-foreground">
                  {prajied?.checkInsFaltantes ?? resumo?.checkInsRestantes ?? 0}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">Tempo mínimo</span>
                <span className="text-foreground">{prajied?.tempoMinimoMeses ?? "—"} meses</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">Dias na graduação</span>
                <span className="text-foreground">{resumo?.diasNaGraduacaoAtual ?? "—"}</span>
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Próximos eventos" className="lg:col-span-3">
            {eventos.length === 0 ? (
              <EmptyState
                title="Nenhum evento de graduação disponível"
                description="Quando houver evento publicado para você, ele aparecerá aqui."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {eventos.map((evento) => (
                  <GraduationEventCard key={evento.eventoId} event={evento} />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </>
  );
}

function GraduationEventCard({ event }: { event: StudentGraduationEvent }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-background/60 p-4 ring-1 ring-border">
      <div className="min-w-0">
        <div className="font-display text-lg text-foreground">{event.titulo}</div>
        <div className="text-xs text-muted-foreground">
          {formatDate(event.data)}
          {event.horaInicio ? ` · ${event.horaInicio.slice(0, 5)}` : ""}
          {event.local ? ` · ${event.local}` : ""}
        </div>
        <div className="mt-1 text-sm text-foreground">
          {event.proximaGraduacao ?? "Graduação destino não informada"} ·{" "}
          {formatCurrency(event.valor)}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusBadge tone={event.elegivel ? "success" : "warning"}>
            {event.elegivel ? "Elegível" : "Ainda não elegível"}
          </StatusBadge>
          {event.statusInscricao && <StatusBadge tone="info">{event.statusInscricao}</StatusBadge>}
          {event.statusConvite && <StatusBadge tone="muted">{event.statusConvite}</StatusBadge>}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={!event.elegivel || Boolean(event.statusInscricao)}
      >
        {event.statusInscricao ? "Inscrito" : "Inscrever-se"}
      </Button>
    </div>
  );
}

function formatCurrency(value: number) {
  return Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
