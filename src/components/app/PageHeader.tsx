import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-border">/</span>}
                <span className={i === breadcrumbs.length - 1 ? "text-foreground/70" : ""}>
                  {b.label}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="heading-hero truncate text-2xl text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
