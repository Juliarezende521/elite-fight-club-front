import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Wallet } from "lucide-react";

import { EmptyState, ErrorStateBox, LoadingState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { queryKeys } from "@/lib/queryKeys";
import {
  fetchStudentInvoices,
  fetchStudentPaymentPreference,
  type StatusFatura,
  type StudentInvoice,
} from "@/lib/student-finance";

export const Route = createFileRoute("/aluno/financeiro")({
  component: Financeiro,
});

function Financeiro() {
  const { authenticatedUser } = useAuth();
  const alunoId = authenticatedUser?.alunoId;

  const faturasQuery = useQuery({
    queryKey: [...queryKeys.alunoFaturas, alunoId],
    queryFn: () => fetchStudentInvoices(alunoId as number),
    enabled: Boolean(alunoId),
  });

  const preferenciaQuery = useQuery({
    queryKey: queryKeys.alunoPreferenciaPagamento,
    queryFn: fetchStudentPaymentPreference,
  });

  const faturas = faturasQuery.data ?? [];
  const faturasOrdenadas = [...faturas].sort(
    (a, b) => new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime(),
  );
  const faturaAtual = escolherFaturaAtual(faturasOrdenadas);
  const saldoPendente = faturas.reduce((total, fatura) => {
    return isFaturaPendente(fatura.status) ? total + Number(fatura.valor ?? 0) : total;
  }, 0);
  const preferencia = preferenciaQuery.data ?? null;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Financeiro" }]}
        title="Meu financeiro"
        subtitle="Mensalidade, forma de pagamento e histórico real."
      />

      {!alunoId ? (
        <ErrorStateBox message="Não foi possível identificar o aluno autenticado." />
      ) : faturasQuery.isLoading || preferenciaQuery.isLoading ? (
        <LoadingState label="Carregando dados financeiros..." />
      ) : faturasQuery.isError || preferenciaQuery.isError ? (
        <div className="space-y-3">
          <ErrorStateBox message="Não foi possível carregar seu financeiro agora." />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void faturasQuery.refetch();
              void preferenciaQuery.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <SectionCard title="Mensalidade" className="lg:col-span-2">
              {faturaAtual ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-display text-3xl text-foreground">
                      {currency(faturaAtual.valor)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vence em {dateLabel(faturaAtual.dataVencimento)} ·{" "}
                      {paymentPreferenceLabel(preferencia)}
                    </div>
                  </div>
                  <StatusBadge tone={statusTone(faturaAtual.status)}>
                    {statusLabel(faturaAtual.status)}
                  </StatusBadge>
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarDays className="h-5 w-5" />}
                  title="Nenhuma fatura encontrada"
                  description="Quando sua mensalidade for gerada, ela aparecerá aqui."
                />
              )}
            </SectionCard>

            <SectionCard title="Saldo">
              <div className="font-display text-2xl text-foreground">{currency(saldoPendente)}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {saldoPendente > 0
                  ? "Cobranças pendentes ou vencidas."
                  : "Sem cobranças pendentes."}
              </p>
            </SectionCard>
          </div>

          <SectionCard title="Histórico">
            {faturasOrdenadas.length === 0 ? (
              <EmptyState
                icon={<Wallet className="h-5 w-5" />}
                title="Nenhum histórico financeiro"
                description="Você ainda não possui faturas registradas."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="pb-2 font-medium">Referência</th>
                      <th className="pb-2 font-medium">Vencimento</th>
                      <th className="pb-2 font-medium">Valor</th>
                      <th className="pb-2 font-medium">Método</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {faturasOrdenadas.map((fatura) => (
                      <tr key={fatura.id}>
                        <td className="py-3 text-muted-foreground">
                          {referenceLabel(fatura.mesReferencia)}
                        </td>
                        <td className="py-3 text-foreground">{dateLabel(fatura.dataVencimento)}</td>
                        <td className="py-3 text-foreground">{currency(fatura.valor)}</td>
                        <td className="py-3 text-muted-foreground">
                          {paymentPreferenceLabel(preferencia)}
                        </td>
                        <td className="py-3">
                          <StatusBadge tone={statusTone(fatura.status)}>
                            {statusLabel(fatura.status)}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </>
  );
}

function escolherFaturaAtual(faturas: StudentInvoice[]) {
  return (
    faturas.find((fatura) => isFaturaPendente(fatura.status)) ??
    faturas.find((fatura) => fatura.status === "PAGA") ??
    faturas[0] ??
    null
  );
}

function isFaturaPendente(status: string) {
  return status === "PENDENTE" || status === "PARCIALMENTE_PAGA" || status === "VENCIDA";
}

function currency(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dateLabel(value?: string | null) {
  if (!value) return "Sem data";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function referenceLabel(value?: string | null) {
  if (!value) return "Sem referência";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function statusLabel(status: string) {
  const labels: Record<StatusFatura, string> = {
    PENDENTE: "Pendente",
    PARCIALMENTE_PAGA: "Parcial",
    VENCIDA: "Vencida",
    PAGA: "Paga",
    CANCELADA: "Cancelada",
  };
  return labels[status as StatusFatura] ?? status;
}

function statusTone(status: string) {
  if (status === "PAGA") return "success";
  if (status === "VENCIDA") return "destructive";
  if (status === "CANCELADA") return "muted";
  return "warning";
}

function paymentPreferenceLabel(
  preferencia: Awaited<ReturnType<typeof fetchStudentPaymentPreference>> | null,
) {
  if (!preferencia?.formaPreferida || !preferencia.ativa) {
    return "Forma de pagamento não definida";
  }

  if (preferencia.descricaoMascarada) {
    return preferencia.descricaoMascarada;
  }

  const labels: Record<string, string> = {
    PIX: "Pix",
    PIX_AUTOMATICO: preferencia.pagamentoAutomaticoAtivo
      ? "Pix Automático"
      : "Pix Automático pendente",
    CARTAO: "Cartão",
    BOLETO: "Boleto",
    DINHEIRO: "Dinheiro",
    OUTRO: "Outra forma",
  };

  return labels[preferencia.formaPreferida] ?? preferencia.formaPreferida;
}
