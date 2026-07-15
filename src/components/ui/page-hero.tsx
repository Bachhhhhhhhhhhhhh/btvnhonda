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
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[4px] border border-[#dce3ec] bg-white p-6 shadow-[0_1px_2px_rgba(7,20,40,0.05)]"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8954a]">
          {kicker}
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#071428]">
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="hero-mesh relative overflow-hidden rounded-[4px] p-6 text-white shadow-[0_8px_24px_-8px_rgba(7,20,40,0.35)] sm:p-7"
    >
      <div className="relative z-10">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4b76a]">
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
