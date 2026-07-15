"use client";

import { useState } from "react";
import { useThemeStore } from "@/lib/theme-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Network,
  FlaskConical,
  Brain,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: Sparkles,
    title: "Chào mừng đến Command Center",
    body: "LOG Twin là DSS sống: mọi KPI, chart, báo cáo tái tính khi bạn đổi policy stacking / transfer / rate card.",
  },
  {
    icon: Network,
    title: "Digital Twin",
    body: "Slider tham số + đèn giao thông 12 tháng + optimizer. Preset Thận trọng / Base / Zero-OS chỉ với 1 click.",
  },
  {
    icon: FlaskConical,
    title: "WSB What-if",
    body: "Sandbox độc lập so Base vs What-if. Stress-test cước, thuê Bắc, stack% rồi mới Apply vào Twin.",
  },
  {
    icon: Brain,
    title: "Insights & AI Brief",
    body: "Alerts, scorecard, grid search max savings, snapshot A/B, cashflow 5 năm — sẵn sàng cho S&OP.",
  },
  {
    icon: FileText,
    title: "Board pack",
    body: "Báo cáo tư vấn 10 mục + Presentation mode fullscreen. In PDF (bật background graphics).",
  },
];

export function OnboardingTour() {
  const { onboardingDone, setOnboardingDone } = useThemeStore();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(!onboardingDone);

  if (!open || onboardingDone) return null;

  const cur = STEPS[step];
  const Icon = cur.icon;
  const last = step === STEPS.length - 1;

  const finish = () => {
    setOnboardingDone(true);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
              Tour {step + 1}/{STEPS.length}
            </div>
            <button type="button" onClick={finish} className="text-[var(--muted)]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-6 py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a4d6e] to-[#071428] text-[#d4b76a]">
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-black text-[var(--ink)]">{cur.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{cur.body}</p>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-[var(--line-soft)] px-5 py-3">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink)] disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-5 bg-[var(--gold)]" : "w-1.5 bg-[var(--line)]"
                  }`}
                />
              ))}
            </div>
            {last ? (
              <div className="flex gap-1.5">
                <Link
                  href="/digital-twin"
                  onClick={finish}
                  className="btn-bank-gold rounded-lg px-3 py-2 text-xs"
                >
                  Bắt đầu
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="btn-bank inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
