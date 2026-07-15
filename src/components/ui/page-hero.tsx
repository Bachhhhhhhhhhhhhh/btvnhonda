"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageHero({
  kicker,
  title,
  subtitle,
  children,
  variant = "dark",
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  variant?: "dark" | "light";
}) {
  if (variant === "light") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-sm)] sm:p-7"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
          {kicker}
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-[1.65rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="hero-mesh relative overflow-hidden rounded-2xl p-6 text-white shadow-[var(--shadow-md)] sm:p-7"
    >
      <div className="relative z-10">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d4b76a]">
          {kicker}
        </div>
        <h1 className="mt-1.5 max-w-3xl text-2xl font-bold tracking-tight sm:text-[1.7rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  );
}
