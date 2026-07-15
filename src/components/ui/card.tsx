import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  hover = false,
  accent = false,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "cc-panel overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]",
        hover && "glass-hover",
        accent && "kpi-ring",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-b border-[var(--line-soft)] bg-[var(--bg)]/40 px-5 py-3.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      className={cn(
        "text-[14px] font-extrabold tracking-tight text-[var(--ink)]",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("mt-0.5 text-xs leading-relaxed text-[var(--muted)]", className)}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
