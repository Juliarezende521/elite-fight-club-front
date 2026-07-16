import { getModality } from "@/mocks";
import type { Modality } from "@/types";
import { cn } from "@/lib/utils";

const toneClasses: Record<Modality["colorToken"], string> = {
  success: "bg-success/12 text-success ring-success/30",
  warning: "bg-warning/12 text-warning ring-warning/30",
  destructive: "bg-destructive/12 text-destructive ring-destructive/30",
  info: "bg-info/12 text-info ring-info/30",
  primary: "bg-primary/15 text-primary ring-primary/30",
};

export function ModalityBadge({ id, className }: { id: string; className?: string }) {
  const m = getModality(id);
  if (!m) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1",
        toneClasses[m.colorToken],
        className,
      )}
    >
      {m.name}
    </span>
  );
}
