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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-6 shadow-sm sm:p-8"
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
          {kicker}
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="hero-mesh relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl shadow-slate-900/25 sm:p-8"
    >
      <div className="relative z-10">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200/90">
          {kicker}
        </div>
        <h1 className="mt-1 max-w-3xl text-2xl font-black tracking-tight sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  );
}
