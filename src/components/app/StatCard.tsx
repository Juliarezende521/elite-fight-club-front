import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
  className?: string;
}) {
  const toneRing: Record<string, string> = {
    default: "ring-border",
    success: "ring-success/40",
    warning: "ring-warning/40",
    destructive: "ring-destructive/40",
    info: "ring-info/40",
  };
  const toneIcon: Record<string, string> = {
    default: "bg-accent text-muted-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
    info: "bg-info/15 text-info",
  };

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg bg-card p-4 ring-1",
        toneRing[tone],
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 font-display text-2xl leading-none text-foreground">{value}</div>
        {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
      </div>
      {icon && (
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md", toneIcon[tone])}>
          {icon}
        </div>
      )}
    </div>
  );
}
