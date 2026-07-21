import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, RefreshCw, Shapes } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorStateBox, LoadingState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import {
  atualizarModalidade,
  criarModalidade,
  fetchModalidades,
  type ApiModalidade,
  type ModalidadePayload,
  type TipoModalidade,
} from "@/lib/modalidades";
import { queryKeys } from "@/lib/queryKeys";

export const Route = createFileRoute("/admin/modalidades")({
  component: ModalidadesPage,
});

interface FormState {
  nome: string;
  descricao: string;
  tipoModalidade: TipoModalidade;
  valorMensalidade: string;
  ativa: boolean;
}

const initialForm: FormState = {
  nome: "",
  descricao: "",
  tipoModalidade: "TURMA",
  valorMensalidade: "0",
  ativa: true,
};

function ModalidadesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiModalidade | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  const modalidadesQuery = useQuery({
    queryKey: queryKeys.modalidades,
    queryFn: fetchModalidades,
  });

  const salvarMutation = useMutation({
    mutationFn: (payload: ModalidadePayload) =>
      editing ? atualizarModalidade(editing.id, payload) : criarModalidade(payload),
    onSuccess: async () => {
      toast.success(editing ? "Modalidade atualizada." : "Modalidade cadastrada.");
      fecharModal();
      await queryClient.invalidateQueries({ queryKey: queryKeys.modalidades });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const modalidades = modalidadesQuery.data ?? [];

  function abrirNovaModalidade() {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  }

  function abrirEdicao(modalidade: ApiModalidade) {
    setEditing(modalidade);
    setForm({
      nome: modalidade.nome,
      descricao: modalidade.descricao ?? "",
      tipoModalidade: modalidade.tipoModalidade === "PERSONAL" ? "PERSONAL" : "TURMA",
      valorMensalidade: String(modalidade.valorMensalidade ?? 0),
      ativa: modalidade.ativa,
    });
    setModalOpen(true);
  }

  function fecharModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(initialForm);
  }

  function submitModalidade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    salvarMutation.mutate({
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      tipoModalidade: form.tipoModalidade,
      valorMensalidade: Number(form.valorMensalidade),
      ativa: form.ativa,
    });
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: "Modalidades" }]}
        title="Modalidades"
        subtitle="Cadastro real de modalidades da academia."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void modalidadesQuery.refetch()}
              disabled={modalidadesQuery.isFetching}
            >
              <RefreshCw className={modalidadesQuery.isFetching ? "animate-spin" : ""} />
              Atualizar
            </Button>
            <Button size="sm" onClick={abrirNovaModalidade}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nova modalidade
            </Button>
          </>
        }
      />

      {modalidadesQuery.isLoading ? (
        <LoadingState label="Carregando modalidades..." />
      ) : modalidadesQuery.isError ? (
        <div className="space-y-3">
          <ErrorStateBox message="Não foi possível carregar as modalidades agora." />
          <Button variant="outline" size="sm" onClick={() => void modalidadesQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : modalidades.length === 0 ? (
        <EmptyState
          icon={<Shapes className="h-5 w-5" />}
          title="Nenhuma modalidade cadastrada"
          description="Cadastre a primeira modalidade para vinculá-la aos alunos."
          action={
            <Button size="sm" onClick={abrirNovaModalidade}>
              <Plus />
              Nova modalidade
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modalidades.map((modalidade) => (
            <SectionCard key={modalidade.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-md bg-info/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-info ring-1 ring-info/30">
                  {tipoLabel(modalidade.tipoModalidade)}
                </span>
                <StatusBadge tone={modalidade.ativa ? "success" : "muted"}>
                  {modalidade.ativa ? "Ativa" : "Inativa"}
                </StatusBadge>
              </div>
              <div className="mt-3 font-display text-xl text-foreground">{modalidade.nome}</div>
              {modalidade.descricao && (
                <p className="mt-1 text-xs text-muted-foreground">{modalidade.descricao}</p>
              )}
              <div className="mt-4 text-xs">
                <div className="text-muted-foreground">Mensalidade sugerida</div>
                <div className="font-display text-lg text-foreground">
                  {currency(modalidade.valorMensalidade)}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => abrirEdicao(modalidade)}>
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : fecharModal())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar modalidade" : "Nova modalidade"}</DialogTitle>
            <DialogDescription>
              Use os campos reais aceitos pelo backend: nome, descrição, tipo, valor e status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitModalidade} className="space-y-4">
            <Field label="Nome" htmlFor="nome">
              <Input
                id="nome"
                value={form.nome}
                onChange={(event) => setForm((state) => ({ ...state, nome: event.target.value }))}
                disabled={salvarMutation.isPending}
                required
              />
            </Field>

            <Field label="Descrição" htmlFor="descricao">
              <Input
                id="descricao"
                value={form.descricao}
                onChange={(event) =>
                  setForm((state) => ({ ...state, descricao: event.target.value }))
                }
                disabled={salvarMutation.isPending}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo" htmlFor="tipoModalidade">
                <Select
                  value={form.tipoModalidade}
                  onValueChange={(value: TipoModalidade) =>
                    setForm((state) => ({ ...state, tipoModalidade: value }))
                  }
                  disabled={salvarMutation.isPending}
                >
                  <SelectTrigger id="tipoModalidade" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TURMA">Turma</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Valor mensal" htmlFor="valorMensalidade">
                <Input
                  id="valorMensalidade"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valorMensalidade}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, valorMensalidade: event.target.value }))
                  }
                  disabled={salvarMutation.isPending}
                  required
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 rounded-md bg-background p-3 text-sm text-foreground ring-1 ring-border">
              <input
                type="checkbox"
                className="accent-primary"
                checked={form.ativa}
                onChange={(event) =>
                  setForm((state) => ({ ...state, ativa: event.target.checked }))
                }
                disabled={salvarMutation.isPending}
              />
              Modalidade ativa
            </label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={fecharModal}
                disabled={salvarMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={salvarMutation.isPending}>
                {salvarMutation.isPending
                  ? "Salvando..."
                  : editing
                    ? "Salvar alterações"
                    : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function tipoLabel(tipo: string) {
  if (tipo === "PERSONAL") return "Personal";
  return "Turma";
}

function currency(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return "Verifique os dados da modalidade e tente novamente.";
    if (error.status === 403) return "Você não tem permissão para gerenciar modalidades.";
  }

  return "Não foi possível salvar a modalidade agora.";
}
