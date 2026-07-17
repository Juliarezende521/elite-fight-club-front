import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { EmptyState } from "@/components/app/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCurrentStudent, mockWeightHistory } from "@/mocks";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/aluno/evolucao")({
  component: Evolucao,
});

function Evolucao() {
  const s = mockCurrentStudent;
  const chart = mockWeightHistory.map((w) => ({ date: w.date.slice(5, 10), peso: w.weight }));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Evolução" }]}
        title="Minha evolução"
        subtitle="Peso, metas, medidas e avaliações corporais."
      />
      <Tabs defaultValue="peso">
        <TabsList>
          <TabsTrigger value="peso">Peso</TabsTrigger>
          <TabsTrigger value="meta">Meta</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="medidas">Medidas</TabsTrigger>
          <TabsTrigger value="bioimpedancia">Bioimpedância</TabsTrigger>
        </TabsList>

        <TabsContent value="peso" className="mt-4">
          <SectionCard title="Evolução do peso">
            <div className="mb-3 grid gap-3 sm:grid-cols-3">
              <Stat label="Peso atual" value={`${s.weightCurrent} kg`} />
              <Stat label="Peso inicial" value={`${mockWeightHistory[0].weight} kg`} />
              <Stat
                label="Diferença"
                value={`-${(mockWeightHistory[0].weight - (s.weightCurrent ?? 0)).toFixed(1)} kg`}
                tone="success"
              />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <AreaChart data={chart} margin={{ left: -10, right: 6, top: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="peso-full" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
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
                    domain={["dataMin - 1", "dataMax + 1"]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="peso"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#peso-full)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="meta" className="mt-4">
          <SectionCard title="Meta de peso">
            <div className="grid gap-4 sm:grid-cols-4">
              <Stat label="Inicial" value={`${mockWeightHistory[0].weight} kg`} />
              <Stat label="Atual" value={`${s.weightCurrent} kg`} />
              <Stat label="Meta" value={`${s.weightGoal} kg`} />
              <Stat
                label="Restante"
                value={`${((s.weightCurrent ?? 0) - (s.weightGoal ?? 0)).toFixed(1)} kg`}
                tone="warning"
              />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="avaliacoes" className="mt-4">
          <EmptyState
            title="Sem avaliações registradas"
            description="Peça ao seu professor a primeira avaliação corporal."
          />
        </TabsContent>
        <TabsContent value="medidas" className="mt-4">
          <EmptyState title="Sem medidas registradas" />
        </TabsContent>
        <TabsContent value="bioimpedancia" className="mt-4">
          <EmptyState title="Sem exames de bioimpedância" />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  const cls =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-md bg-background/60 p-3 ring-1 ring-border">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={"font-display text-xl " + cls}>{value}</div>
    </div>
  );
}
