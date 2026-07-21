import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  QrCode,
  TrendingDown,
  Wallet,
} from "lucide-react";

import { EmptyState, ErrorStateBox, LoadingState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth/context";
import { queryKeys } from "@/lib/queryKeys";
import {
  calculateCurrentStreak,
  fetchStudentCheckIns,
  fetchStudentDashboard,
  getLastDaysRange,
  type StudentClassSummary,
} from "@/lib/student-dashboard";

export const Route = createFileRoute("/aluno/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aluno · Elite Fight Club" },
      { name: "description", content: "Sua evolução, aulas e financeiro em um só lugar." },
    ],
  }),
  component: AlunoDashboard,
});

const historyRange = getLastDaysRange(90);

function AlunoDashboard() {
  const { authenticatedUser } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: queryKeys.alunoDashboard,
    queryFn: fetchStudentDashboard,
  });
  const checkInsQuery = useQuery({
    queryKey: [...queryKeys.alunoCheckIns, historyRange.inicio, historyRange.fim],
    queryFn: () => fetchStudentCheckIns(historyRange.inicio, historyRange.fim),
  });

  const data = dashboardQuery.data;
  const firstName = (data?.nome ?? authenticatedUser?.nome ?? "aluno").split(" ")[0];

  if (dashboardQuery.isLoading) {
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: "Aluno" }, { label: "Dashboard" }]}
          title={`Olá, ${firstName}`}
          subtitle="Aqui está um resumo do seu treino, evolução e conta."
        />
        <LoadingState label="Carregando seus dados..." />
      </>
    );
  }

  if (dashboardQuery.isError || !data) {
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: "Aluno" }, { label: "Dashboard" }]}
          title={`Olá, ${firstName}`}
          subtitle="Aqui está um resumo do seu treino, evolução e conta."
        />
        <ErrorStateBox message="Não foi possível carregar seu dashboard agora." />
      </>
    );
  }

  const checkIns = data.checkIns;
  const prajied = data.prajied;
  const financeiro = data.financeiro;
  const plano = data.plano;
  const peso = data.evolucaoPeso;
  const metaPeso = data.metaPeso;
  const checkInHistory = checkInsQuery.data?.checkIns ?? [];
  const streak = calculateCurrentStreak(checkInHistory);
  const progressPct = Number(prajied?.percentualProgresso ?? 0);
  const requiredCheckIns = prajied?.checkInsNecessariosProximaGraduacao ?? 0;
  const currentCheckIns = prajied?.checkInsAtuais ?? checkIns?.total ?? 0;
  const aulasHoje = data.aulasHoje ?? [];
  const proximasAulas = (data.aulasSemana ?? []).slice(0, 4);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Dashboard" }]}
        title={`Olá, ${firstName}`}
        subtitle="Aqui está um resumo do seu treino, evolução e conta."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/aluno/aulas">
                <CalendarDays className="mr-1.5 h-4 w-4" />
                Ver agenda
              </Link>
            </Button>
            <Button size="sm">
              <QrCode className="mr-1.5 h-4 w-4" />
              Check-in
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-lg bg-card p-5 ring-1 ring-border lg:col-span-2">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={data.ativo ? "success" : "muted"}>
                  {data.ativo ? "Ativo" : "Inativo"}
                </StatusBadge>
                {plano?.tipo && <StudentTypeBadge tipo={plano.tipo} />}
              </div>
              <h2 className="heading-hero mt-3 text-3xl text-foreground sm:text-4xl">
                {data.nome}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {prajied ? `Faixa ${prajied.nome}` : "Graduação inicial não configurada"} · streak
                de <span className="text-warning">{streak} dias</span>
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-md bg-background/60 p-3 ring-1 ring-border">
              <div
                className="h-10 w-10 rounded-md ring-2 ring-border"
                style={{ backgroundColor: prajied?.corHex ?? "var(--color-accent)" }}
                aria-hidden
              />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Próxima graduação
                </div>
                <div className="font-display text-base text-foreground">
                  {prajied?.proximoPrajiedNome ?? "Sem próxima graduação"}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="uppercase tracking-widest text-muted-foreground">
                Progresso para a próxima faixa
              </span>
              <span className="font-display text-foreground">
                {currentCheckIns} / {requiredCheckIns}
              </span>
            </div>
            <Progress value={progressPct} className="mt-2 h-2" />
            <div className="mt-1 text-[11px] text-muted-foreground">
              {prajied
                ? `Faltam ${Math.max(0, prajied.checkInsFaltantes ?? 0)} check-ins · ${Math.round(progressPct)}% concluído`
                : "Graduação inicial não configurada"}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Mensalidade
              </div>
              <div className="mt-2 font-display text-2xl text-foreground">
                {formatCurrency(financeiro?.valorTotal ?? plano?.valor ?? 0)}
              </div>
            </div>
            <StatusBadge tone={financeiro?.emDia ? "success" : "warning"}>
              {formatFinancialStatus(financeiro?.status, financeiro?.emDia)}
            </StatusBadge>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <Row label="Vencimento" value={formatDate(financeiro?.vencimento) ?? "Sem fatura"} />
            <Row
              label="Forma preferida"
              value={data.preferenciaPagamento?.formaPreferida ?? "Não informada"}
            />
            <Row
              label="Saldo"
              value={financeiro?.faturaAtualId ? formatCurrency(financeiro.saldo) : "Sem fatura"}
            />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
            <Link to="/aluno/financeiro">
              <Wallet className="mr-1.5 h-4 w-4" />
              Ver financeiro
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Check-ins no mês"
          value={checkIns?.noMesAtual ?? 0}
          hint={
            (checkIns?.total ?? 0) === 0 ? "Nenhum check-in registrado" : "Dados reais do aluno"
          }
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
        />
        <StatCard
          label="Streak"
          value={`${streak} dias`}
          hint={streak === 0 ? "Faça check-in para iniciar" : "Continue o ritmo!"}
          icon={<Flame className="h-4 w-4" />}
          tone="warning"
        />
        <StatCard
          label="Peso atual"
          value={peso?.pesoAtual ? `${formatNumber(peso.pesoAtual)} kg` : "—"}
          hint={
            peso?.pesoAtual
              ? formatWeightDifference(peso.diferencaPeso)
              : "Peso ainda não informado"
          }
          icon={<TrendingDown className="h-4 w-4" />}
          tone="info"
        />
        <StatCard
          label="Próxima graduação"
          value={prajied?.proximoPrajiedNome ?? "—"}
          hint={
            metaPeso?.quantidadeRestante
              ? `Faltam ${formatNumber(metaPeso.quantidadeRestante)} kg para a meta`
              : "Sem meta ativa"
          }
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Aulas de hoje"
          action={
            <Button size="sm" variant="ghost" asChild>
              <Link to="/aluno/aulas">
                Todas <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {aulasHoje.length === 0 ? (
            <EmptyState
              title="Nenhuma aula agendada"
              description="Quando houver aula ou personal marcado para hoje, ela aparecerá aqui."
            />
          ) : (
            <ul className="divide-y divide-border">
              {aulasHoje.map((aula) => (
                <ClassListItem key={`${aula.tipo}-${aula.aulaId}`} aula={aula} />
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Evolução do peso">
          {peso?.pesoAtual ? (
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <div className="font-display text-2xl text-foreground">
                  {formatNumber(peso.pesoAtual)} kg
                </div>
                <div className="text-xs text-success">
                  {formatWeightDifference(peso.diferencaPeso)}
                </div>
              </div>
              <div className="rounded-md bg-background/60 p-4 text-xs text-muted-foreground ring-1 ring-border">
                Último registro em {formatDate(peso.dataPesoAtual) ?? "data não informada"}.
                {peso.totalRegistros <= 1 ? " Ainda não há histórico suficiente para gráfico." : ""}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Menor {peso.menorPeso ? `${formatNumber(peso.menorPeso)} kg` : "—"}</span>
                <span>Maior {peso.maiorPeso ? `${formatNumber(peso.maiorPeso)} kg` : "—"}</span>
              </div>
            </div>
          ) : (
            <EmptyState title="Peso ainda não informado" />
          )}
        </SectionCard>

        <SectionCard className="lg:col-span-2" title="Próximas aulas">
          {proximasAulas.length === 0 ? (
            <EmptyState
              title="Nenhuma aula agendada"
              description="Suas próximas aulas confirmadas aparecerão aqui."
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {proximasAulas.map((aula) => (
                <ClassCard key={`${aula.tipo}-${aula.aulaId}`} aula={aula} />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Check-ins recentes">
          {checkInsQuery.isLoading ? (
            <LoadingState label="Carregando check-ins..." />
          ) : checkInHistory.length === 0 ? (
            <EmptyState title="Nenhum check-in registrado" />
          ) : (
            <ul className="space-y-3">
              {checkInHistory.slice(0, 4).map((checkIn) => (
                <li key={checkIn.id} className="flex gap-3">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      Check-in registrado
                    </div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">
                      {formatDateTime(checkIn.realizadoEm)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}

function ClassListItem({ aula }: { aula: StudentClassSummary }) {
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent">
        <Dumbbell className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{aula.modalidade ?? aula.tipo}</span>
          <StudentTypeBadge tipo={aula.tipo} />
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {formatTimeRange(aula.horaInicio, aula.horaFim)} · {aula.professorNome}
        </div>
      </div>
      <StatusBadge tone={aula.checkInRealizado ? "success" : "info"}>
        {aula.checkInRealizado ? "Check-in feito" : aula.status}
      </StatusBadge>
    </li>
  );
}

function ClassCard({ aula }: { aula: StudentClassSummary }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-background/60 p-3 ring-1 ring-border">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm uppercase tracking-wide text-foreground">
            {formatShortDate(aula.data)}
          </span>
          <span className="text-xs text-muted-foreground">
            · {formatTimeRange(aula.horaInicio, aula.horaFim)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <StudentTypeBadge tipo={aula.tipo} />
          <span className="truncate text-xs text-muted-foreground">{aula.professorNome}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {aula.tipo}
        </div>
        <div className="font-display text-sm text-foreground">{aula.status}</div>
      </div>
    </div>
  );
}

function StudentTypeBadge({ tipo }: { tipo: string }) {
  const label = tipo === "PERSONAL" ? "Personal" : tipo === "TURMA" ? "Turma" : tipo;

  return (
    <span className="inline-flex items-center rounded-md bg-info/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-info ring-1 ring-info/30">
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(Number(value));
}

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatShortDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeRange(start: string, end: string) {
  return `${start.slice(0, 5)}-${end.slice(0, 5)}`;
}

function formatWeightDifference(value?: number | null) {
  if (value === null || value === undefined) return "Sem variação registrada";
  if (value === 0) return "Peso estável";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)} kg`;
}

function formatFinancialStatus(status?: string, emDia?: boolean) {
  if (!status || status === "SEM_FATURA") return "Sem fatura";
  if (emDia) return "Em dia";
  if (status === "VENCIDA") return "Vencida";
  if (status === "PENDENTE") return "Pendente";
  return status.replaceAll("_", " ");
}
