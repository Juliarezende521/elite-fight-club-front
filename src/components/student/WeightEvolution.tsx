import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, RefreshCw, LoaderCircle, Save } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { queryKeys } from "@/lib/queryKeys";
import { formatLocalDate } from "@/lib/student-dashboard";
import {
  chronologicalWeights,
  createStudentWeight,
  deleteStudentWeight,
  fetchStudentWeightSummary,
  formatWeight,
  formatWeightDate,
  listStudentWeights,
  updateStudentWeight,
  validateWeight,
  weightErrorMessage,
  type StudentWeightRecord,
  type WeightPayload,
} from "@/lib/student-evolution";
import { EmptyState, ErrorStateBox, LoadingState } from "@/components/app/EmptyState";
import { SectionCard } from "@/components/app/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { WeightChart } from "./WeightChart";

export function WeightEvolution() {
  const { firebaseUser, authenticatedUser, isDemoSession } = useAuth();
  const scope = [
    firebaseUser?.uid ?? "",
    authenticatedUser?.academia?.id ?? 0,
    authenticatedUser?.alunoId ?? 0,
  ] as const;
  const allowed = Boolean(
    firebaseUser &&
    authenticatedUser?.perfil === "ALUNO" &&
    authenticatedUser.ativo &&
    authenticatedUser.academia &&
    authenticatedUser.alunoId &&
    !isDemoSession,
  );
  return allowed ? (
    <WeightContent key={JSON.stringify(scope)} scope={scope} />
  ) : (
    <ErrorStateBox message="Entre com uma conta de aluno para consultar seu peso." />
  );
}

function WeightContent({ scope }: { scope: readonly [string, number, number] }) {
  const client = useQueryClient();
  const rootKey = queryKeys.alunoPesos(...scope);
  const recordsQuery = useQuery({
    queryKey: [...rootKey, "historico"],
    queryFn: listStudentWeights,
    retry: false,
  });
  const summaryQuery = useQuery({
    queryKey: [...rootKey, "resumo"],
    queryFn: fetchStudentWeightSummary,
    retry: false,
  });
  const [form, setForm] = useState<{ record: StudentWeightRecord | null } | null>(null);
  const [deleting, setDeleting] = useState<StudentWeightRecord | null>(null);
  const [success, setSuccess] = useState("");
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: rootKey }),
      client.invalidateQueries({ queryKey: queryKeys.alunoDashboard }),
    ]);
  };
  const save = useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: WeightPayload }) =>
      id === undefined ? createStudentWeight(payload) : updateStudentWeight(id, payload),
    onSuccess: async () => {
      await refresh();
      setForm(null);
      setSuccess("Registro salvo.");
    },
  });
  const remove = useMutation({
    mutationFn: deleteStudentWeight,
    onSuccess: async () => {
      await refresh();
      setDeleting(null);
      setSuccess("Registro excluído.");
    },
  });
  const records = chronologicalWeights(recordsQuery.data ?? []);
  const summary = summaryQuery.data;
  const busy = save.isPending || remove.isPending;
  const openForm = (record: StudentWeightRecord | null) => {
    save.reset();
    setSuccess("");
    setForm({ record });
  };
  const retry = () => {
    void recordsQuery.refetch();
    void summaryQuery.refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          disabled={busy || recordsQuery.isFetching || summaryQuery.isFetching}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
        <Button size="sm" onClick={() => openForm(null)} disabled={busy}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar peso
        </Button>
      </div>
      {success && (
        <p role="status" className="text-sm text-success">
          {success}
        </p>
      )}
      {recordsQuery.isPending || summaryQuery.isPending ? (
        <LoadingState label="Carregando evolução do peso..." />
      ) : recordsQuery.isError || summaryQuery.isError ? (
        <div className="space-y-3" role="alert">
          <ErrorStateBox message={weightErrorMessage(recordsQuery.error ?? summaryQuery.error)} />
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      ) : !summary ? (
        <ErrorStateBox message="Não foi possível obter o resumo do peso." />
      ) : records.length === 0 ? (
        <EmptyState
          title="Nenhum peso registrado"
          description="Seu histórico aparecerá após o primeiro registro."
        />
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Peso atual", formatWeight(summary.pesoAtual)],
              ["Peso inicial", formatWeight(summary.pesoInicial)],
              ["Diferença", formatWeight(summary.diferencaPeso)],
              ["Menor peso", formatWeight(summary.menorPeso)],
              ["Maior peso", formatWeight(summary.maiorPeso)],
              ["Registros", String(summary.totalRegistros)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-card p-3 ring-1 ring-border">
                <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-display text-xl">{value}</dd>
              </div>
            ))}
          </dl>
          <SectionCard title="Evolução do peso">
            <WeightChart records={records} />
          </SectionCard>
          <SectionCard title="Histórico de peso">
            <ul className="divide-y divide-border">
              {[...records].reverse().map((record) => (
                <li
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-x-4">
                      <time dateTime={record.dataRegistro}>
                        {formatWeightDate(record.dataRegistro)}
                      </time>
                      <strong>{formatWeight(record.peso)}</strong>
                    </div>
                    <p className="mt-1 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                      {record.observacao || "Sem observação"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Editar registro"
                      aria-label={`Editar registro de ${formatWeightDate(record.dataRegistro)}`}
                      disabled={busy}
                      onClick={() => openForm(record)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Excluir registro"
                      aria-label={`Excluir registro de ${formatWeightDate(record.dataRegistro)}`}
                      disabled={busy}
                      onClick={() => {
                        remove.reset();
                        setSuccess("");
                        setDeleting(record);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </>
      )}
      <Dialog
        open={Boolean(form)}
        onOpenChange={(open) => {
          if (!open && !save.isPending) setForm(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.record ? "Editar peso" : "Registrar peso"}</DialogTitle>
            <DialogDescription>Peso em quilogramas e data do registro.</DialogDescription>
          </DialogHeader>
          {form && (
            <WeightForm
              record={form.record}
              pending={save.isPending}
              error={save.error}
              onCancel={() => setForm(null)}
              onSave={(payload) => save.mutateAsync({ id: form.record?.id, payload })}
            />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleting(null);
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro de peso?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `O registro de ${formatWeightDate(deleting.dataRegistro)} será retirado do seu histórico.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.isError && (
            <p role="alert" className="text-sm text-destructive">
              {weightErrorMessage(remove.error)}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={remove.isPending || !deleting}
              onClick={() => {
                if (deleting && !remove.isPending) remove.mutate(deleting.id);
              }}
            >
              {remove.isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {remove.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WeightForm({
  record,
  pending,
  error,
  onSave,
  onCancel,
}: {
  record: StudentWeightRecord | null;
  pending: boolean;
  error: unknown;
  onSave: (payload: WeightPayload) => Promise<unknown>;
  onCancel: () => void;
}) {
  const [peso, setPeso] = useState(record ? String(record.peso).replace(".", ",") : "");
  const [date, setDate] = useState(record?.dataRegistro ?? formatLocalDate(new Date()));
  const [note, setNote] = useState(record?.observacao ?? "");
  const [errors, setErrors] = useState<Partial<Record<keyof WeightPayload, string>>>({});
  const submitting = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || pending) return;
    const result = validateWeight(peso, date, note);
    setErrors(result.errors);
    if (Object.keys(result.errors).length) return;
    submitting.current = true;
    try {
      await onSave(result.payload);
    } catch {
      /* The mutation renders a safe error message. */
    } finally {
      submitting.current = false;
    }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="weight-value">Peso (kg)</Label>
        <Input
          id="weight-value"
          inputMode="decimal"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          disabled={pending}
          aria-invalid={Boolean(errors.peso)}
          aria-describedby={errors.peso ? "weight-error" : undefined}
        />
        {errors.peso && (
          <p id="weight-error" role="alert" className="mt-1 text-sm text-destructive">
            {errors.peso}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="weight-date">Data</Label>
        <Input
          id="weight-date"
          type="date"
          value={date}
          max={formatLocalDate(new Date())}
          onChange={(e) => setDate(e.target.value)}
          disabled={pending}
          aria-invalid={Boolean(errors.dataRegistro)}
          aria-describedby={errors.dataRegistro ? "date-error" : undefined}
        />
        {errors.dataRegistro && (
          <p id="date-error" role="alert" className="mt-1 text-sm text-destructive">
            {errors.dataRegistro}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="weight-note">Observação (opcional)</Label>
        <Textarea
          id="weight-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          disabled={pending}
        />
        {errors.observacao && <p role="alert">{errors.observacao}</p>}
      </div>
      {Boolean(error) && (
        <p role="alert" className="text-sm text-destructive">
          {weightErrorMessage(error)}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {pending ? "Salvando..." : "Salvar registro"}
        </Button>
      </div>
    </form>
  );
}
