import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Nada por aqui",
  description,
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-accent text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="mt-4 font-display text-lg uppercase tracking-wide text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card/40 p-10 text-sm text-muted-foreground">
      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      {label}
    </div>
  );
}

export function ErrorStateBox({ message = "Não foi possível carregar." }: { message?: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center text-sm text-destructive">
      {message}
    </div>
  );
}
