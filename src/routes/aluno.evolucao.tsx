import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { EmptyState } from "@/components/app/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeightEvolution } from "@/components/student/WeightEvolution";
import { WeightChart } from "@/components/student/WeightChart";
import { useAuth } from "@/lib/auth/context";
import { appEnv } from "@/lib/env";
import { mockCurrentStudent, mockWeightHistory } from "@/mocks";

export const Route = createFileRoute("/aluno/evolucao")({ component: EvolutionPage });

export function EvolutionPage() {
  const { isDemoSession } = useAuth();
  const demo = appEnv.enableDemoMode && isDemoSession;
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Evolução" }]}
        title="Minha evolução"
        subtitle="Peso, metas, medidas e avaliações corporais."
      />
      {demo && (
        <p role="status" className="mb-4 text-sm text-muted-foreground">
          Demonstração · dados fictícios
        </p>
      )}
      <Tabs defaultValue="peso">
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="peso">Peso</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            <TabsTrigger value="medidas">Medidas</TabsTrigger>
            <TabsTrigger value="bioimpedancia">Bioimpedância</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="peso" className="mt-4">
          {demo ? <DemoWeight /> : <WeightEvolution />}
        </TabsContent>
        <TabsContent value="meta" className="mt-4">
          {demo ? <DemoGoal /> : <Developing title="Meta de peso em desenvolvimento" />}
        </TabsContent>
        <TabsContent value="avaliacoes" className="mt-4">
          <Developing
            title={demo ? "Sem avaliações registradas" : "Avaliações em desenvolvimento"}
          />
        </TabsContent>
        <TabsContent value="medidas" className="mt-4">
          <Developing title={demo ? "Sem medidas registradas" : "Medidas em desenvolvimento"} />
        </TabsContent>
        <TabsContent value="bioimpedancia" className="mt-4">
          <Developing
            title={demo ? "Sem exames de bioimpedância" : "Bioimpedância em desenvolvimento"}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Developing({ title }: { title: string }) {
  return <EmptyState title={title} />;
}

function DemoWeight() {
  const current = mockCurrentStudent.weightCurrent;
  return (
    <SectionCard title="Evolução do peso">
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <Stat label="Peso atual" value={`${current} kg`} />
        <Stat label="Peso inicial" value={`${mockWeightHistory[0].weight} kg`} />
        <Stat
          label="Diferença"
          value={`-${(mockWeightHistory[0].weight - (current ?? 0)).toFixed(1)} kg`}
        />
      </div>
      <WeightChart
        records={mockWeightHistory.map((w) => ({
          dataRegistro: w.date.slice(0, 10),
          peso: w.weight,
        }))}
      />
    </SectionCard>
  );
}

function DemoGoal() {
  const student = mockCurrentStudent;
  return (
    <SectionCard title="Meta de peso">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Inicial" value={`${mockWeightHistory[0].weight} kg`} />
        <Stat label="Atual" value={`${student.weightCurrent} kg`} />
        <Stat label="Meta" value={`${student.weightGoal} kg`} />
        <Stat
          label="Restante"
          value={`${((student.weightCurrent ?? 0) - (student.weightGoal ?? 0)).toFixed(1)} kg`}
        />
      </div>
    </SectionCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/60 p-3 ring-1 ring-border">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-xl text-foreground">{value}</div>
    </div>
  );
}
