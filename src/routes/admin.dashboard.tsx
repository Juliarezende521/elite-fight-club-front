import { createFileRoute } from "@tanstack/react-router";
import { DemoOnlyContent } from "@/components/auth/DemoOnlyContent";
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Wallet,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ModalityBadge } from "@/components/app/ModalityBadge";
import {
  mockMonthlyRevenue,
  mockWeeklyCheckIns,
  mockStudents,
  mockModalities,
  mockInvoices,
  getModality,
} from "@/mocks";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Admin · Elite Fight Club" },
      { name: "description", content: "Visão geral de alunos, receita e operação." },
    ],
  }),
  component: () => (
    <DemoOnlyContent>
      <AdminDashboard />
    </DemoOnlyContent>
  ),
});

const currency = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function AdminDashboard() {
  const ativos = mockStudents.filter((s) => s.status === "ativo").length;
  const inadimplentes = mockStudents.filter((s) => s.financialStatus === "atrasado").length;
  const previsto = 50500;
  const recebido = 48200;
  const pendente = previsto - recebido;
  const receitaPct = Math.round((recebido / previsto) * 100);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
        title="Visão geral"
        subtitle="Panorama financeiro, operacional e de alunos."
        actions={
          <Button size="sm" variant="outline">
            Exportar relatório
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de alunos"
          value={mockStudents.length}
          hint={<span className="text-success">+8 este mês</span>}
          icon={<Users className="h-4 w-4" />}
          tone="info"
        />
        <StatCard
          label="Alunos ativos"
          value={ativos}
          hint={`${Math.round((ativos / mockStudents.length) * 100)}% da base`}
          icon={<UserCheck className="h-4 w-4" />}
          tone="success"
        />
        <StatCard
          label="Inadimplentes"
          value={inadimplentes}
          hint="Atrasados há +5 dias"
          icon={<UserX className="h-4 w-4" />}
          tone="destructive"
        />
        <StatCard
          label="Receita do mês"
          value={currency(recebido)}
          hint={<span className="text-success">{receitaPct}% do previsto</span>}
          icon={<DollarSign className="h-4 w-4" />}
          tone="success"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Receita mensal — previsto vs. recebido"
          action={
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <Legendish color="var(--color-chart-5)" label="Previsto" />
              <Legendish color="var(--color-chart-2)" label="Recebido" />
            </div>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart
                data={mockMonthlyRevenue}
                margin={{ left: -20, right: 6, top: 5, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => currency(v)}
                />
                <Bar dataKey="previsto" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recebido" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Resumo financeiro">
          <div className="space-y-4">
            <BigStat label="Previsto" value={currency(previsto)} tone="muted" />
            <BigStat label="Recebido" value={currency(recebido)} tone="success" />
            <BigStat label="Pendente" value={currency(pendente)} tone="warning" />
            <div>
              <div className="mb-1 flex justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
                <span>Cobertura do mês</span>
                <span>{receitaPct}%</span>
              </div>
              <Progress value={receitaPct} className="h-2" />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Check-ins na semana">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-display text-2xl text-foreground">
              {mockWeeklyCheckIns.reduce((a, b) => a + b.total, 0)}
            </span>
            <span className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer>
              <LineChart
                data={mockWeeklyCheckIns}
                margin={{ left: -20, right: 6, top: 5, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-info)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-info)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Modalidades ativas">
          <ul className="space-y-2">
            {mockModalities
              .filter((m) => m.active)
              .slice(0, 5)
              .map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <ModalityBadge id={m.id} />
                    <span className="truncate text-sm text-foreground">
                      {m.weeklyClasses} aulas/semana
                    </span>
                  </div>
                  <span className="font-display text-sm text-foreground">{m.studentsCount}</span>
                </li>
              ))}
          </ul>
        </SectionCard>

        <SectionCard title="Alertas">
          <ul className="space-y-3">
            <Alert
              icon={<AlertTriangle className="h-4 w-4" />}
              tone="destructive"
              title={`${inadimplentes} inadimplentes`}
              description="Acompanhar cobranças e ligar até sexta."
            />
            <Alert
              icon={<Activity className="h-4 w-4" />}
              tone="warning"
              title="Turma lotada"
              description="Muay Thai 12:00 — sem vagas nos próximos 3 dias."
            />
            <Alert
              icon={<Wallet className="h-4 w-4" />}
              tone="info"
              title="Pix Automático"
              description={`${mockStudents.filter((s) => s.preferredPayment === "pix_auto").length} alunos usam Pix Automático.`}
            />
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Pagamentos recentes">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-2 font-medium">Aluno</th>
                <th className="pb-2 font-medium">Modalidade</th>
                <th className="pb-2 font-medium">Valor</th>
                <th className="pb-2 font-medium">Vencimento</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockInvoices.map((inv) => {
                const student = mockStudents.find((s) => s.id === inv.studentId);
                const mid = student?.modalityIds[0];
                const tone =
                  inv.status === "em_dia"
                    ? "success"
                    : inv.status === "atrasado"
                      ? "destructive"
                      : "warning";
                return (
                  <tr key={inv.id}>
                    <td className="py-3 font-medium text-foreground">{student?.name}</td>
                    <td className="py-3">{mid ? <ModalityBadge id={mid} /> : "—"}</td>
                    <td className="py-3 text-foreground">
                      {inv.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(inv.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3">
                      <StatusBadge tone={tone}>
                        {inv.status === "em_dia"
                          ? "Em dia"
                          : inv.status === "atrasado"
                            ? "Atrasado"
                            : "Pendente"}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

function Legendish({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function BigStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "success" | "warning";
}) {
  const cls =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={"font-display text-2xl " + cls}>{value}</div>
    </div>
  );
}

function Alert({
  icon,
  tone,
  title,
  description,
}: {
  icon: React.ReactNode;
  tone: "destructive" | "warning" | "info";
  title: string;
  description: string;
}) {
  const bg =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive ring-destructive/30"
      : tone === "warning"
        ? "bg-warning/10 text-warning ring-warning/30"
        : "bg-info/10 text-info ring-info/30";
  return (
    <li className="flex gap-3">
      <div className={"grid h-8 w-8 shrink-0 place-items-center rounded-md ring-1 " + bg}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </li>
  );
}
