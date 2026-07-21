import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, RefreshCw, Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
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
import { http, ApiError } from "@/lib/api";
import { fetchModalidades, type ApiModalidade } from "@/lib/modalidades";
import { queryKeys } from "@/lib/queryKeys";

export const Route = createFileRoute("/admin/alunos")({
  component: AdminAlunosPage,
});

type TipoAluno = "TURMA" | "AULA" | "PERSONAL";

interface ApiAcademia {
  id: number;
  nome: string;
  status?: string;
}

interface ApiGraduacao {
  id: number;
  nome: string;
  corHex?: string;
}

interface ApiPlano {
  id: number;
  tipo: "TURMA" | "PERSONAL";
  quantidadeAulasSemana: number;
  valor: number | string;
  ativo: boolean;
}

interface ApiAluno {
  id: number;
  nome: string;
  cpf?: string;
  idade: number;
  peso: number;
  altura: number;
  valorMensalidade: number | string;
  graduacao?: string;
  graduacaoAtual?: ApiGraduacao | null;
  graduacaoEntidade?: ApiGraduacao | null;
  email?: string;
  tipoAluno: TipoAluno;
  diaVencimento: number;
  quantidadeCheckins: number;
  ativo: boolean;
  academia?: ApiAcademia | null;
  plano?: ApiPlano | null;
  modalidades?: ApiModalidade[];
}

interface CriarAlunoPayload {
  nome: string;
  email: string;
  senhaInicial: string;
  tipoAluno: TipoAluno;
  valorMensalidade: number;
  diaVencimento: number;
  planoId?: number;
  modalidadeIds: number[];
}

interface AtualizarAlunoPayload {
  nome: string;
  email: string;
  tipoAluno: TipoAluno;
  valorMensalidade: number;
  diaVencimento: number;
  planoId?: number;
  ativo: boolean;
  modalidadeIds: number[];
}

interface AtualizarModalidadesPayload {
  modalidadeIds: number[];
}

interface FormState {
  nome: string;
  email: string;
  senhaInicial: string;
  tipoAluno: TipoAluno;
  valorMensalidade: string;
  diaVencimento: string;
  planoId: string;
  modalidadeIds: string[];
  ativo: boolean;
}

const initialForm: FormState = {
  nome: "",
  email: "",
  senhaInicial: "",
  tipoAluno: "TURMA",
  valorMensalidade: "",
  diaVencimento: "1",
  planoId: "sem-plano",
  modalidadeIds: [],
  ativo: true,
};

const currency = (value?: number | string | null) => {
  const amount = Number(value ?? 0);
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

function AdminAlunosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalidadesModalOpen, setModalidadesModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<ApiAluno | null>(null);
  const [editingAluno, setEditingAluno] = useState<ApiAluno | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [modalidadesForm, setModalidadesForm] = useState<string[]>([]);

  const alunosQuery = useQuery({
    queryKey: queryKeys.adminAlunos,
    queryFn: () => http.get<ApiAluno[]>("/api/alunos"),
  });

  const planosQuery = useQuery({
    queryKey: queryKeys.adminPlanos,
    queryFn: () => http.get<ApiPlano[]>("/api/planos"),
  });

  const modalidadesQuery = useQuery({
    queryKey: queryKeys.modalidades,
    queryFn: fetchModalidades,
  });

  const criarAlunoMutation = useMutation({
    mutationFn: (payload: CriarAlunoPayload) =>
      http.post<ApiAluno, CriarAlunoPayload>("/api/alunos", payload),
    onSuccess: async () => {
      toast.success("Aluno cadastrado com sucesso.");
      setModalOpen(false);
      setForm(initialForm);
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminAlunos });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "cadastrar"));
    },
  });

  const atualizarAlunoMutation = useMutation({
    mutationFn: ({ alunoId, payload }: { alunoId: number; payload: AtualizarAlunoPayload }) =>
      http.put<ApiAluno, AtualizarAlunoPayload>(`/api/alunos/${alunoId}`, payload),
    onSuccess: async () => {
      toast.success("Aluno atualizado com sucesso.");
      fecharAlunoModal();
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminAlunos });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "editar"));
    },
  });

  const atualizarModalidadesMutation = useMutation({
    mutationFn: ({ alunoId, payload }: { alunoId: number; payload: AtualizarModalidadesPayload }) =>
      http.put<ApiAluno, AtualizarModalidadesPayload>(
        `/api/alunos/${alunoId}/modalidades`,
        payload,
      ),
    onSuccess: async () => {
      toast.success("Modalidades do aluno atualizadas.");
      fecharModalidadesModal();
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminAlunos });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "editar"));
    },
  });

  const alunos = useMemo(() => alunosQuery.data ?? [], [alunosQuery.data]);
  const filteredAlunos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return alunos;
    return alunos.filter((aluno) =>
      [aluno.nome, aluno.email].some((value) => value?.toLowerCase().includes(term)),
    );
  }, [alunos, search]);

  const activePlanos = (planosQuery.data ?? []).filter((plano) => plano.ativo);
  const activeModalidades = (modalidadesQuery.data ?? []).filter((modalidade) => modalidade.ativa);
  const allModalidades = modalidadesQuery.data ?? [];

  function submitAluno(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const valorMensalidade = Number(form.valorMensalidade);
    const diaVencimento = Number(form.diaVencimento);
    const planoId = form.planoId !== "sem-plano" ? Number(form.planoId) : undefined;
    const modalidadeIds = form.modalidadeIds.map(Number);

    if (editingAluno) {
      atualizarAlunoMutation.mutate({
        alunoId: editingAluno.id,
        payload: {
          nome: form.nome.trim(),
          email: form.email.trim(),
          tipoAluno: form.tipoAluno,
          valorMensalidade,
          diaVencimento,
          planoId,
          ativo: form.ativo,
          modalidadeIds,
        },
      });
      return;
    }

    criarAlunoMutation.mutate({
      nome: form.nome.trim(),
      email: form.email.trim(),
      senhaInicial: form.senhaInicial,
      tipoAluno: form.tipoAluno,
      valorMensalidade,
      diaVencimento,
      planoId,
      modalidadeIds,
    });
  }

  function abrirNovoAlunoModal() {
    setEditingAluno(null);
    setForm(initialForm);
    setModalOpen(true);
  }

  function abrirEditarAlunoModal(aluno: ApiAluno) {
    setEditingAluno(aluno);
    setForm({
      nome: aluno.nome ?? "",
      email: aluno.email ?? "",
      senhaInicial: "",
      tipoAluno: aluno.tipoAluno,
      valorMensalidade: String(aluno.valorMensalidade ?? ""),
      diaVencimento: String(aluno.diaVencimento ?? 1),
      planoId: aluno.plano?.id ? String(aluno.plano.id) : "sem-plano",
      modalidadeIds: (aluno.modalidades ?? []).map((modalidade) => String(modalidade.id)),
      ativo: Boolean(aluno.ativo),
    });
    setModalOpen(true);
  }

  function fecharAlunoModal() {
    setModalOpen(false);
    setEditingAluno(null);
    setForm(initialForm);
  }

  function abrirModalidadesModal(aluno: ApiAluno) {
    setSelectedAluno(aluno);
    setModalidadesForm((aluno.modalidades ?? []).map((modalidade) => String(modalidade.id)));
    setModalidadesModalOpen(true);
  }

  function fecharModalidadesModal() {
    setModalidadesModalOpen(false);
    setSelectedAluno(null);
    setModalidadesForm([]);
  }

  function submitModalidades(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAluno) return;

    atualizarModalidadesMutation.mutate({
      alunoId: selectedAluno.id,
      payload: {
        modalidadeIds: modalidadesForm.map(Number),
      },
    });
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: "Alunos" }]}
        title="Alunos"
        subtitle="Base real de alunos vinculada ao backend Spring Boot."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void alunosQuery.refetch()}
              disabled={alunosQuery.isFetching}
            >
              <RefreshCw className={alunosQuery.isFetching ? "animate-spin" : ""} />
              Atualizar
            </Button>
            <Button size="sm" onClick={abrirNovoAlunoModal}>
              <Plus />
              Novo aluno
            </Button>
          </>
        }
      />

      <SectionCard
        title="Alunos cadastrados"
        action={
          <span className="text-xs text-muted-foreground">
            {filteredAlunos.length} de {alunos.length}
          </span>
        }
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="bg-background pl-8"
            />
          </div>
        </div>

        {alunosQuery.isLoading ? (
          <LoadingState label="Carregando alunos..." />
        ) : alunosQuery.isError ? (
          <div className="space-y-3">
            <ErrorStateBox message="Não foi possível carregar os alunos agora." />
            <Button variant="outline" size="sm" onClick={() => void alunosQuery.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : alunos.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="Nenhum aluno cadastrado"
            description="Quando novos alunos forem cadastrados, eles aparecerão aqui."
            action={
              <Button size="sm" onClick={abrirNovoAlunoModal}>
                <Plus />
                Novo aluno
              </Button>
            }
          />
        ) : filteredAlunos.length === 0 ? (
          <EmptyState
            title="Nenhum resultado"
            description="Tente buscar por outro nome ou e-mail."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="pb-2 font-medium">Aluno</th>
                  <th className="pb-2 font-medium">Situação</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium">Plano</th>
                  <th className="pb-2 font-medium">Modalidades</th>
                  <th className="pb-2 font-medium">Mensalidade</th>
                  <th className="pb-2 font-medium">Vencimento</th>
                  <th className="pb-2 font-medium">Graduação</th>
                  <th className="pb-2 text-right font-medium">Check-ins</th>
                  <th className="pb-2 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAlunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-foreground">{aluno.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {aluno.email || "Sem e-mail"}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge tone={aluno.ativo ? "success" : "muted"}>
                        {aluno.ativo ? "Ativo" : "Inativo"}
                      </StatusBadge>
                    </td>
                    <td className="py-3 pr-4 text-foreground">{tipoAlunoLabel(aluno.tipoAluno)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{planoLabel(aluno.plano)}</td>
                    <td className="py-3 pr-4">
                      <ModalidadesCell aluno={aluno} />
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {currency(aluno.valorMensalidade)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">Dia {aluno.diaVencimento}</td>
                    <td className="py-3 pr-4">
                      <GraduacaoCell aluno={aluno} />
                    </td>
                    <td className="py-3 text-right font-display text-foreground">
                      {aluno.quantidadeCheckins ?? 0}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEditarAlunoModal(aluno)}
                          disabled={modalidadesQuery.isLoading}
                        >
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalidadesModal(aluno)}
                          disabled={modalidadesQuery.isLoading}
                        >
                          Modalidades
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => (open ? setModalOpen(true) : fecharAlunoModal())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAluno ? "Editar aluno" : "Novo aluno"}</DialogTitle>
            <DialogDescription>
              {editingAluno
                ? "Atualize os dados básicos, plano, status e modalidades do aluno."
                : "O cadastro cria o usuário no Firebase e vincula o aluno à sua academia."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitAluno} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" htmlFor="nome">
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(event) => setForm((state) => ({ ...state, nome: event.target.value }))}
                  disabled={criarAlunoMutation.isPending || atualizarAlunoMutation.isPending}
                  required
                />
              </Field>
              <Field label="E-mail" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, email: event.target.value }))
                  }
                  disabled={criarAlunoMutation.isPending || atualizarAlunoMutation.isPending}
                  required
                />
              </Field>
            </div>

            {!editingAluno && (
              <Field label="Senha inicial" htmlFor="senhaInicial">
                <Input
                  id="senhaInicial"
                  type="password"
                  value={form.senhaInicial}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, senhaInicial: event.target.value }))
                  }
                  disabled={criarAlunoMutation.isPending}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Mínimo 8 caracteres, com letra maiúscula, minúscula e número.
                </p>
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Tipo" htmlFor="tipoAluno">
                <Select
                  value={form.tipoAluno}
                  onValueChange={(value: TipoAluno) =>
                    setForm((state) => ({ ...state, tipoAluno: value }))
                  }
                  disabled={criarAlunoMutation.isPending || atualizarAlunoMutation.isPending}
                >
                  <SelectTrigger id="tipoAluno" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TURMA">Turma</SelectItem>
                    <SelectItem value="AULA">Aula</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Mensalidade" htmlFor="valorMensalidade">
                <Input
                  id="valorMensalidade"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.valorMensalidade}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, valorMensalidade: event.target.value }))
                  }
                  disabled={criarAlunoMutation.isPending || atualizarAlunoMutation.isPending}
                  required
                />
              </Field>
              <Field label="Vencimento" htmlFor="diaVencimento">
                <Input
                  id="diaVencimento"
                  type="number"
                  min="1"
                  max="28"
                  value={form.diaVencimento}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, diaVencimento: event.target.value }))
                  }
                  disabled={criarAlunoMutation.isPending || atualizarAlunoMutation.isPending}
                  required
                />
              </Field>
            </div>

            <Field label="Plano" htmlFor="planoId">
              <Select
                value={form.planoId}
                onValueChange={(value) => setForm((state) => ({ ...state, planoId: value }))}
                disabled={
                  criarAlunoMutation.isPending ||
                  atualizarAlunoMutation.isPending ||
                  planosQuery.isLoading
                }
              >
                <SelectTrigger id="planoId" className="bg-background">
                  <SelectValue placeholder="Selecionar plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem-plano">Sem plano vinculado</SelectItem>
                  {activePlanos.map((plano) => (
                    <SelectItem key={plano.id} value={String(plano.id)}>
                      {planoLabel(plano)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Modalidades contratadas" htmlFor="modalidades">
              {modalidadesQuery.isLoading ? (
                <div className="rounded-md bg-background p-3 text-xs text-muted-foreground ring-1 ring-border">
                  Carregando modalidades...
                </div>
              ) : activeModalidades.length === 0 ? (
                <div className="rounded-md bg-background p-3 text-xs text-muted-foreground ring-1 ring-border">
                  Nenhuma modalidade ativa cadastrada.
                </div>
              ) : (
                <div id="modalidades" className="grid gap-2 sm:grid-cols-2">
                  {activeModalidades.map((modalidade) => {
                    const selected = form.modalidadeIds.includes(String(modalidade.id));

                    return (
                      <label
                        key={modalidade.id}
                        className="flex cursor-pointer items-start gap-2 rounded-md bg-background p-3 text-sm ring-1 ring-border"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 accent-primary"
                          checked={selected}
                          disabled={
                            criarAlunoMutation.isPending || atualizarAlunoMutation.isPending
                          }
                          onChange={(event) =>
                            setForm((state) => ({
                              ...state,
                              modalidadeIds: event.target.checked
                                ? [...state.modalidadeIds, String(modalidade.id)]
                                : state.modalidadeIds.filter((id) => id !== String(modalidade.id)),
                            }))
                          }
                        />
                        <span>
                          <span className="block font-medium text-foreground">
                            {modalidade.nome}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {modalidade.tipoModalidade} · {currency(modalidade.valorMensalidade)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Planos de turma exigem ao menos uma modalidade contratada.
              </p>
            </Field>

            {editingAluno && (
              <label className="flex items-center gap-2 rounded-md bg-background p-3 text-sm text-foreground ring-1 ring-border">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={form.ativo}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, ativo: event.target.checked }))
                  }
                  disabled={atualizarAlunoMutation.isPending}
                />
                Aluno ativo
              </label>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={fecharAlunoModal}
                disabled={criarAlunoMutation.isPending || atualizarAlunoMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={criarAlunoMutation.isPending || atualizarAlunoMutation.isPending}
              >
                {criarAlunoMutation.isPending || atualizarAlunoMutation.isPending
                  ? "Salvando..."
                  : editingAluno
                    ? "Salvar alterações"
                    : "Cadastrar aluno"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalidadesModalOpen}
        onOpenChange={(open) => (open ? setModalidadesModalOpen(true) : fecharModalidadesModal())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar modalidades</DialogTitle>
            <DialogDescription>
              Atualize as modalidades contratadas de {selectedAluno?.nome ?? "aluno"}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitModalidades} className="space-y-4">
            {modalidadesQuery.isLoading ? (
              <LoadingState label="Carregando modalidades..." />
            ) : allModalidades.length === 0 ? (
              <EmptyState
                title="Nenhuma modalidade cadastrada"
                description="Cadastre uma modalidade antes de vincular ao aluno."
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {allModalidades.map((modalidade) => {
                  const selected = modalidadesForm.includes(String(modalidade.id));
                  const disabled =
                    atualizarModalidadesMutation.isPending || (!modalidade.ativa && !selected);

                  return (
                    <label
                      key={modalidade.id}
                      className="flex cursor-pointer items-start gap-2 rounded-md bg-background p-3 text-sm ring-1 ring-border"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 accent-primary"
                        checked={selected}
                        disabled={disabled}
                        onChange={(event) =>
                          setModalidadesForm((state) =>
                            event.target.checked
                              ? [...state, String(modalidade.id)]
                              : state.filter((id) => id !== String(modalidade.id)),
                          )
                        }
                      />
                      <span>
                        <span className="block font-medium text-foreground">{modalidade.nome}</span>
                        <span className="block text-xs text-muted-foreground">
                          {modalidade.tipoModalidade} · {currency(modalidade.valorMensalidade)}
                          {!modalidade.ativa ? " · Inativa" : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={fecharModalidadesModal}
                disabled={atualizarModalidadesMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={atualizarModalidadesMutation.isPending || allModalidades.length === 0}
              >
                {atualizarModalidadesMutation.isPending ? "Salvando..." : "Salvar modalidades"}
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

function GraduacaoCell({ aluno }: { aluno: ApiAluno }) {
  const graduacao = aluno.graduacaoAtual ?? aluno.graduacaoEntidade;
  const nome = graduacao?.nome ?? aluno.graduacao ?? "Sem graduação";

  return (
    <span className="inline-flex items-center gap-2 text-foreground">
      {graduacao?.corHex && (
        <span
          className="h-3 w-3 rounded-sm ring-1 ring-border"
          style={{ background: graduacao.corHex }}
        />
      )}
      {nome}
    </span>
  );
}

function ModalidadesCell({ aluno }: { aluno: ApiAluno }) {
  const modalidades = aluno.modalidades ?? [];
  if (modalidades.length === 0) {
    return <span className="text-xs text-muted-foreground">Sem modalidade</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {modalidades.map((modalidade) => (
        <span
          key={modalidade.id}
          className="inline-flex items-center rounded-md bg-info/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-info ring-1 ring-info/30"
        >
          {modalidade.nome}
        </span>
      ))}
    </div>
  );
}

function tipoAlunoLabel(tipo: TipoAluno) {
  const labels: Record<TipoAluno, string> = {
    TURMA: "Turma",
    AULA: "Aula",
    PERSONAL: "Personal",
  };
  return labels[tipo] ?? tipo;
}

function planoLabel(plano?: ApiPlano | null) {
  if (!plano) return "Sem plano";
  return `${tipoAlunoLabel(plano.tipo)} · ${plano.quantidadeAulasSemana}x/sem · ${currency(plano.valor)}`;
}

function errorMessage(error: unknown, action: "cadastrar" | "editar" = "cadastrar") {
  if (error instanceof ApiError) {
    if (error.message && error.message !== "Não foi possível concluir a solicitação.") {
      return error.message;
    }
    if (error.status === 400) return "Verifique os dados do aluno e tente novamente.";
    if (error.status === 409) return "Já existe um cadastro com esses dados.";
    if (error.status === 403) return "Você não tem permissão para alterar alunos.";
  }

  return action === "editar"
    ? "Não foi possível atualizar o aluno agora."
    : "Não foi possível cadastrar o aluno agora.";
}
