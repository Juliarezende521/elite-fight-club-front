import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "destructive" | "info" | "muted";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/15 text-success ring-success/30",
  warning: "bg-warning/15 text-warning ring-warning/30",
  destructive: "bg-destructive/15 text-destructive ring-destructive/30",
  info: "bg-info/15 text-info ring-info/30",
  muted: "bg-accent text-muted-foreground ring-border",
};

export function StatusBadge({
  tone = "muted",
  children,
  dot = true,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
