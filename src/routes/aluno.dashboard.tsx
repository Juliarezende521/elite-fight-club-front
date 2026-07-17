import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CalendarDays,
  Dumbbell,
  Flame,
  QrCode,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ModalityBadge } from "@/components/app/ModalityBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  mockCurrentStudent,
  mockClasses,
  mockNotifications,
  mockWeightHistory,
  getPrajied,
  getModality,
  getProfessor,
} from "@/mocks";

export const Route = createFileRoute("/aluno/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aluno · Elite Fight Club" },
      { name: "description", content: "Sua evolução, aulas e financeiro em um só lugar." },
    ],
  }),
  component: AlunoDashboard,
});

function AlunoDashboard() {
  const s = mockCurrentStudent;
  const prajied = getPrajied(s.prajiedId);
  const next = s.nextPrajiedId ? getPrajied(s.nextPrajiedId) : undefined;
  const progressPct = Math.min(
    100,
    Math.round((s.checkInsTotal / (s.requiredCheckIns || 1)) * 100),
  );
  const weightLoss = mockWeightHistory[0].weight - (s.weightCurrent ?? 0);
  const goalDelta = (s.weightCurrent ?? 0) - (s.weightGoal ?? 0);
  const weightChart = mockWeightHistory.map((w) => ({
    date: w.date.slice(5, 10),
    peso: w.weight,
  }));

  const todaysClasses = mockClasses.filter((c) => {
    const d = new Date(c.date);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });
  const upcoming = mockClasses.slice(0, 4);

  const unread = mockNotifications.filter((n) => !n.read);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Dashboard" }]}
        title={`Olá, ${s.name.split(" ")[0]}`}
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

      {/* Hero card */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-lg bg-card p-5 ring-1 ring-border lg:col-span-2">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={s.status === "ativo" ? "success" : "muted"}>
                  {s.status === "ativo" ? "Ativo" : "Inativo"}
                </StatusBadge>
                {s.modalityIds.map((id) => (
                  <ModalityBadge key={id} id={id} />
                ))}
              </div>
              <h2 className="heading-hero mt-3 text-3xl text-foreground sm:text-4xl">{s.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {prajied ? `Faixa ${prajied.name}` : "—"} · streak de{" "}
                <span className="text-warning">{s.streak} dias</span>
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-md bg-background/60 p-3 ring-1 ring-border">
              <div
                className="h-10 w-10 rounded-md ring-2 ring-border"
                style={{ backgroundColor: prajied?.colorHex }}
                aria-hidden
              />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Próxima graduação
                </div>
                <div className="font-display text-base text-foreground">{next?.name ?? "—"}</div>
              </div>
            </div>
          </div>

          <div className="relative mt-5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="uppercase tracking-widest text-muted-foreground">
                Progresso para a próxima faixa
              </span>
              <span className="font-display text-foreground">
                {s.checkInsTotal} / {s.requiredCheckIns}
              </span>
            </div>
            <Progress value={progressPct} className="mt-2 h-2" />
            <div className="mt-1 text-[11px] text-muted-foreground">
              Faltam {Math.max(0, s.requiredCheckIns - s.checkInsTotal)} check-ins · {progressPct}%
              concluído
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Mensalidade
              </div>
              <div className="mt-2 font-display text-2xl text-foreground">R$ 289,90</div>
            </div>
            <StatusBadge tone={s.financialStatus === "em_dia" ? "success" : "warning"}>
              {s.financialStatus === "em_dia" ? "Em dia" : "Pendente"}
            </StatusBadge>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <Row label="Vencimento" value="10 do próximo mês" />
            <Row label="Forma preferida" value="Pix Automático" />
            <Row label="Último pagamento" value="10/07/2026" />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
            <Link to="/aluno/financeiro">
              <Wallet className="mr-1.5 h-4 w-4" />
              Ver financeiro
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Check-ins no mês"
          value={s.checkInsMonth}
          hint={<span className="text-success">+3 vs. mês anterior</span>}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
        />
        <StatCard
          label="Streak"
          value={`${s.streak} dias`}
          hint="Continue o ritmo!"
          icon={<Flame className="h-4 w-4" />}
          tone="warning"
        />
        <StatCard
          label="Peso atual"
          value={`${s.weightCurrent} kg`}
          hint={<span className="text-success">-{weightLoss.toFixed(1)} kg em 90 dias</span>}
          icon={<TrendingDown className="h-4 w-4" />}
          tone="info"
        />
        <StatCard
          label="Próxima graduação"
          value={next?.name ?? "—"}
          hint={goalDelta > 0 ? `Faltam ${goalDelta.toFixed(1)} kg para a meta` : "Meta atingida"}
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      {/* Two-column */}
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
          {todaysClasses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma aula programada para hoje.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {todaysClasses.map((c) => {
                const modality = getModality(c.modalityId);
                const professor = getProfessor(c.professorId);
                const lotada = c.reserved >= c.capacity;
                return (
                  <li key={c.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{modality?.name}</span>
                        <ModalityBadge id={c.modalityId} />
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {c.time} · {professor?.name} · {c.reserved}/{c.capacity} vagas
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {lotada ? (
                        <StatusBadge tone="destructive">Lotada</StatusBadge>
                      ) : (
                        <StatusBadge tone="success">Aberta</StatusBadge>
                      )}
                      <Button size="sm" variant={lotada ? "outline" : "default"} disabled={lotada}>
                        Reservar
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Evolução do peso">
          <div className="mb-2 flex items-baseline justify-between">
            <div className="font-display text-2xl text-foreground">{s.weightCurrent} kg</div>
            <div className="text-xs text-success">-{weightLoss.toFixed(1)} kg / 90d</div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer>
              <AreaChart data={weightChart} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="peso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--color-muted-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="peso"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#peso)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Inicial {mockWeightHistory[0].weight} kg</span>
            <span>Meta {s.weightGoal} kg</span>
          </div>
        </SectionCard>

        <SectionCard className="lg:col-span-2" title="Próximas aulas">
          <div className="grid gap-2 sm:grid-cols-2">
            {upcoming.map((c) => {
              const modality = getModality(c.modalityId);
              const professor = getProfessor(c.professorId);
              const d = new Date(c.date);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-md bg-background/60 p-3 ring-1 ring-border"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm uppercase tracking-wide text-foreground">
                        {d.toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">· {c.time}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <ModalityBadge id={c.modalityId} />
                      <span className="truncate text-xs text-muted-foreground">
                        {professor?.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.type === "personal" ? "Personal" : "Turma"}
                    </div>
                    <div className="font-display text-sm text-foreground">
                      {c.reserved}/{c.capacity}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Notificações"
          action={
            <Button size="sm" variant="ghost" asChild>
              <Link to="/aluno/notificacoes">
                Todas <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {unread.slice(0, 4).map((n) => (
              <li key={n.id} className="flex gap-3">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-muted-foreground">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{n.title}</div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">{n.message}</div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
