import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg bg-card p-4 ring-1 ring-border", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-2">
          {typeof title === "string" ? (
            <h2 className="font-display text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </h2>
          ) : (
            title
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
