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
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {kicker}
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0a1628]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
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
      className="hero-mesh relative overflow-hidden rounded-lg p-6 text-white shadow-lg sm:p-7"
    >
      <div className="relative z-10">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#c4a35a]">
          {kicker}
        </div>
        <h1 className="mt-1 max-w-3xl text-2xl font-bold tracking-tight sm:text-[1.75rem]">
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
