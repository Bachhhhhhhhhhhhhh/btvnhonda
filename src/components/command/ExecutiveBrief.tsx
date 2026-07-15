"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTwinStore } from "@/lib/store";
import {
  buildAlerts,
  buildInsights,
  optimizePolicy,
  scorecard,
  unitEconomics,
} from "@/lib/engine/analytics";
import { fmt, fmtPct } from "@/lib/utils";
import {
  BrainCircuit,
  RefreshCw,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export function ExecutiveBrief() {
  const { result, params } = useTwinStore();
  const [seed, setSeed] = useState(0);

  const brief = useMemo(() => {
    void seed;
    const a = result.annual;
    const sc = scorecard(result, params);
    const opt = optimizePolicy(params);
    const ue = unitEconomics(params);
    const alerts = buildAlerts(result, params);
    const insights = buildInsights(result, params);
    const red = result.months.filter((m) => m.classification === "red");
    const crit = alerts.filter((x) => x.level === "critical");

    const verdict =
      sc.overall >= 75
        ? "SẴN SÀNG TRIỂN KHAI"
        : sc.overall >= 55
          ? "TRIỂN KHAI CÓ ĐIỀU KIỆN"
          : "CẦN HIỆU CHỈNH POLICY";

    const paragraphs = [
      `Health score ${sc.overall}/100 — ${verdict}. Twin đang chạy stack ${fmtPct(params.importStackRatio, 0)} · transfer ${fmtPct(params.transferRatio, 0)} · chuẩn ${params.useTtlCapacity ? "TTL Cap" : "Fact Cap"}.`,
      `Impact tài chính: tiết kiệm ${fmt(a.totalSavings / 1e9, 2)} tỷ VND/năm (baseline ${fmt(a.baselineCost / 1e9, 2)} → tối ưu ${fmt(a.totalCost / 1e9, 2)}), ROI ${fmtPct(a.roi)}, NPV 3 năm ${fmt(a.npv / 1e9, 2)} tỷ, payback ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "n/a"}.`,
      `Vận hành: relief ${fmt(a.importRelief)} xe-eq · ${fmt(a.m2Saved)} m²; outsource ${fmt(a.outsourceVol)} (giảm ${fmt(a.outsourceReduction)}); cont N→S ${fmt(a.nsContainersBase)}; case pool peak ${fmt(a.peakCasePool)}.`,
      `Unit economics transfer ${ue.justified ? "DƯƠNG" : "ÂM"}: TF ~${fmt(Math.round(ue.transfer))} vs avoid ${fmt(ue.avoid)} VND/xe (biên ${ue.margin >= 0 ? "+" : ""}${fmt(Math.round(ue.margin))}).`,
      red.length
        ? `Rủi ro peak: ${red.length} tháng ĐỎ (${red.map((m) => m.month).join(", ")}) — pre-book cont/case pool T-4.`
        : `Rủi ro peak: không tháng residual đỏ với policy hiện tại.`,
      `Optimizer lưới đề xuất stack ${fmtPct(opt.bestStackRatio, 0)} · TF ${fmtPct(opt.bestTransferRatio, 0)} → max ${fmt(opt.bestSavings / 1e9, 2)} tỷ (Δ ${fmt((opt.bestSavings - a.totalSavings) / 1e9, 2)} tỷ vs Twin).`,
      crit.length
        ? `Critical alerts: ${crit.map((c) => c.title).join("; ")}.`
        : `Không có critical alert — có thể escalate pilot stacking.`,
      `Hành động đề xuất: (1) Pilot stack NK · (2) Lock rate card · (3) Stress-test trên WSB · (4) Board pack /report.`,
    ];

    return {
      verdict,
      score: sc.overall,
      paragraphs,
      topInsight: insights[0],
      alertCount: alerts.length,
      critCount: crit.length,
    };
  }, [result, params, seed]);

  return (
    <div className="cc-panel relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[var(--navy)] via-[var(--gold)] to-[var(--navy)]" />
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line-soft)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#0a4d6e] to-[#071428] text-[#d4b76a] shadow-lg">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
              AI Executive Brief · auto
            </div>
            <div className="text-base font-bold text-[var(--ink)]">
              Tóm tắt điều hành thông minh
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
              brief.score >= 75
                ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                : brief.score >= 55
                  ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
            }`}
          >
            {brief.verdict}
          </span>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--muted)] hover:bg-[var(--bg)]"
          >
            <RefreshCw className="h-3 w-3" />
            Regen
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-12">
        <div className="space-y-3 p-5 lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={seed + brief.score}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2.5"
            >
              {brief.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-[13.5px] leading-relaxed text-[var(--muted)]"
                >
                  <span className="mr-2 font-mono text-[10px] font-bold text-[var(--gold)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {p}
                </p>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-[var(--line-soft)] bg-[var(--bg)]/60 p-5 lg:col-span-4 lg:border-l lg:border-t-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            Quick stats
          </div>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
                Health
              </span>
              <span className="text-lg font-black tabular-nums text-[var(--ink)]">
                {brief.score}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                Critical
              </span>
              <span className="text-lg font-black tabular-nums text-[var(--ink)]">
                {brief.critCount}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
                Alerts
              </span>
              <span className="text-lg font-black tabular-nums text-[var(--ink)]">
                {brief.alertCount}
              </span>
            </div>
          </div>
          {brief.topInsight && (
            <div className="mt-4 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold-soft)]/30 p-3">
              <div className="text-[10px] font-bold uppercase text-[var(--gold)]">
                Top insight
              </div>
              <p className="mt-1 text-xs font-semibold leading-snug text-[var(--ink)]">
                {brief.topInsight.headline}
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-1.5">
            {[
              { href: "/wsb", l: "Stress-test WSB" },
              { href: "/insights", l: "Optimizer hub" },
              { href: "/report", l: "Board pack" },
            ].map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--gold)]/40"
              >
                {x.l}
                <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
