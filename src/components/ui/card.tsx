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
  /** Gold top hairline like bank product cards */
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass overflow-hidden rounded-[4px]",
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
        "border-b border-[#eef2f6] bg-[#fafbfc] px-5 py-3.5",
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
        "text-[14px] font-bold tracking-tight text-[#071428]",
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
    <p className={cn("mt-0.5 text-xs leading-relaxed text-slate-500", className)}>
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
