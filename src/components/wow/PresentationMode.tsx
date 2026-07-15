"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTwinStore } from "@/lib/store";
import { fmt, fmtPct } from "@/lib/utils";
import { optimizePolicy, buildAlerts, scorecard } from "@/lib/engine/analytics";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

const SLIDES = 6;

export function PresentationMode() {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const { result, params } = useTwinStore();
  const a = result.annual;
  const opt = optimizePolicy(params);
  const alerts = buildAlerts(result, params);
  const sc = scorecard(result, params);
  const red = result.months.filter((m) => m.classification === "red");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setSlide((s) => Math.min(SLIDES - 1, s + 1));
      if (e.key === "ArrowLeft") setSlide((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES);
    }, 8000);
    return () => clearInterval(t);
  }, [open]);

  const slides = [
    {
      kicker: "Executive headline",
      title: "Capacity miền Bắc — quyết định bằng số",
      body: `Tiết kiệm mô hình ${fmt(a.totalSavings / 1e9, 2)} tỷ VND/năm · ROI ${fmtPct(a.roi)} · NPV 3y ${fmt(a.npv / 1e9, 2)} tỷ.`,
      metrics: [
        { l: "Savings", v: `${fmt(a.totalSavings / 1e9, 2)} tỷ` },
        { l: "ROI", v: fmtPct(a.roi) },
        { l: "Health", v: `${sc.overall}/100` },
      ],
    },
    {
      kicker: "Policy live",
      title: `Stack ${fmtPct(params.importStackRatio, 0)} · Transfer ${fmtPct(params.transferRatio, 0)}`,
      body: `Relief ${fmt(a.importRelief)} xe-eq · ${fmt(a.m2Saved)} m² · Outsource ${fmt(a.outsourceVol)} · Cont ${fmt(a.nsContainersBase)}.`,
      metrics: [
        { l: "Relief", v: fmt(a.importRelief) },
        { l: "Transfer", v: fmt(a.transferVol) },
        { l: "z_t", v: fmt(a.outsourceVol) },
      ],
    },
    {
      kicker: "Optimizer",
      title: "Policy tối ưu lưới",
      body: `Gợi ý stack ${fmtPct(opt.bestStackRatio, 0)} · TF ${fmtPct(opt.bestTransferRatio, 0)} → max ${fmt(opt.bestSavings / 1e9, 2)} tỷ (Δ ${fmt((opt.bestSavings - a.totalSavings) / 1e9, 2)} tỷ vs Twin).`,
      metrics: [
        { l: "Best S", v: fmtPct(opt.bestStackRatio, 0) },
        { l: "Best T", v: fmtPct(opt.bestTransferRatio, 0) },
        { l: "Max save", v: `${fmt(opt.bestSavings / 1e9, 2)} tỷ` },
      ],
    },
    {
      kicker: "Peak risk",
      title: red.length ? `${red.length} tháng residual ĐỎ` : "Không tháng đỏ",
      body: red.length
        ? `Tháng: ${red.map((m) => m.month).join(", ")}. Pre-book container & case pool từ T-4.`
        : "Policy hiện tại hấp thụ peak residual dưới ngưỡng đỏ. Vẫn monitor Dec–Mar nếu bật TTL.",
      metrics: [
        { l: "Pool peak", v: fmt(a.peakCasePool) },
        { l: "Cont", v: fmt(a.nsContainersBase) },
        { l: "Red months", v: String(red.length) },
      ],
    },
    {
      kicker: "Alerts",
      title: `${alerts.length} tín hiệu điều hành`,
      body:
        alerts.slice(0, 3).map((x) => x.title).join(" · ") ||
        "Hệ thống ổn định — không critical.",
      metrics: [
        {
          l: "Critical",
          v: String(alerts.filter((x) => x.level === "critical").length),
        },
        {
          l: "Warning",
          v: String(alerts.filter((x) => x.level === "warning").length),
        },
        { l: "Good", v: String(alerts.filter((x) => x.level === "good").length) },
      ],
    },
    {
      kicker: "Ask leadership",
      title: "Ba quyết định hôm nay",
      body: "1) Approve pilot stacking NK · 2) Lock rate card Finance · 3) Pre-book cont tháng đỏ T-4. Mở WSB để stress-test trước khi commit.",
      metrics: [
        { l: "G1", v: "Pilot" },
        { l: "G2", v: "Rate card" },
        { l: "G3", v: "Pre-book" },
      ],
    },
  ];

  const cur = slides[slide];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSlide(0);
          setOpen(true);
        }}
        className="btn-bank-gold no-print inline-flex items-center gap-1.5 px-3 py-2 text-xs shadow-md"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        Presentation mode
      </button>

      {open && (
        <div className="fixed inset-0 z-[300] flex flex-col bg-[#050d18] text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d4b76a]">
              LOG Twin · Board presentation · {slide + 1}/{SLIDES}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-white/20 p-2 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-6 py-10">
            <button
              type="button"
              onClick={() => setSlide((s) => Math.max(0, s - 1))}
              className="absolute left-4 rounded-full border border-white/15 bg-white/5 p-3 hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSlide((s) => Math.min(SLIDES - 1, s + 1))}
              className="absolute right-4 rounded-full border border-white/15 bg-white/5 p-3 hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -12 }}
                transition={{ duration: 0.45 }}
                className="w-full max-w-4xl"
              >
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#d4b76a]">
                  {cur.kicker}
                </div>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                  {cur.title}
                </h2>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">
                  {cur.body}
                </p>
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {cur.metrics.map((m) => (
                    <div
                      key={m.l}
                      className="rounded-lg border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#d4b76a]">
                        {m.l}
                      </div>
                      <div className="mt-2 text-3xl font-black tabular-nums tracking-tight">
                        {m.v}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 pb-6">
            {Array.from({ length: SLIDES }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? "w-8 bg-[#d4b76a]" : "w-3 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
