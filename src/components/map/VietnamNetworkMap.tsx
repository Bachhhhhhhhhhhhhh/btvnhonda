"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LANES,
  REGION_CAPS,
  REGION_COLOR,
  REGION_LABEL,
  WAREHOUSES,
  type Region,
  type WarehouseNode,
} from "@/lib/data/warehouseNetwork";
import { fmt } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTwinStore } from "@/lib/store";

type Props = {
  showLanes?: boolean;
  filterRegion?: Region | "all";
  compact?: boolean;
  className?: string;
  onSelect?: (wh: WarehouseNode | null) => void;
};

/** Stylized Vietnam land path — more recognizable S-shape */
const VN_PATH = `
  M 46 6
  C 52 5, 58 6, 61 10
  C 64 14, 62 17, 59 19
  C 56 21, 57 24, 55 27
  C 53 30, 55 33, 53 36
  C 51 39, 54 42, 52 45
  C 50 48, 54 50, 56 53
  C 58 56, 57 59, 55 62
  C 53 65, 55 68, 54 71
  C 53 74, 56 77, 54 80
  C 52 83, 50 86, 47 89
  C 44 92, 40 94, 37 91
  C 34 88, 37 85, 39 82
  C 41 79, 39 76, 40 73
  C 41 70, 39 67, 41 64
  C 43 61, 41 58, 42 55
  C 43 52, 41 49, 43 46
  C 45 43, 43 40, 44 37
  C 45 34, 43 31, 44 28
  C 45 25, 43 22, 44 19
  C 45 16, 43 13, 44 10
  C 45 8, 44 7, 46 6
  Z
`;

export function VietnamNetworkMap({
  showLanes = true,
  filterRegion = "all",
  compact = false,
  className,
  onSelect,
}: Props) {
  const [selected, setSelected] = useState<WarehouseNode | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [laneOn, setLaneOn] = useState(showLanes);
  const [localFilter, setLocalFilter] = useState<Region | "all">(filterRegion);
  const [tick, setTick] = useState(0);
  const transferVol = useTwinStore((s) => s.result.annual.transferVol);
  const nsCont = useTwinStore((s) => s.result.annual.nsContainersBase);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => (x + 1) % 100), 80);
    return () => clearInterval(t);
  }, []);

  const activeFilter = filterRegion !== "all" ? filterRegion : localFilter;

  const nodes = useMemo(
    () =>
      activeFilter === "all"
        ? WAREHOUSES
        : WAREHOUSES.filter((w) => w.region === activeFilter),
    [activeFilter]
  );

  const byId = useMemo(() => {
    const m = new Map<string, WarehouseNode>();
    WAREHOUSES.forEach((w) => m.set(w.id, w));
    return m;
  }, []);

  const select = (w: WarehouseNode | null) => {
    setSelected(w);
    onSelect?.(w);
  };

  const maxCap = Math.max(...WAREHOUSES.map((w) => w.cap100));

  return (
    <div className={cn("relative", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setLaneOn((v) => !v)}
          className={cn(
            "rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition",
            laneOn
              ? "border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/20"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          {laneOn ? "● Live routes N→S" : "○ Bật tuyến N→S"}
        </button>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "Toàn quốc"],
              ["north", "Bắc"],
              ["central", "Trung"],
              ["south", "Nam"],
            ] as const
          ).map(([k, lab]) => (
            <button
              type="button"
              key={k}
              onClick={() => setLocalFilter(k)}
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-bold transition",
                activeFilter === k
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {lab}
              {k !== "all" && (
                <span className="ml-1 opacity-70">
                  {REGION_CAPS[k as Region].ratio}%
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500">
          <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
            Twin transfer: {fmt(transferVol)} xe
          </span>
          <span className="rounded-full bg-teal-50 px-2 py-1 text-teal-700">
            {fmt(nsCont)} cont/năm
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100" />
            Owned
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 ring-2 ring-amber-100" />
            Rented
          </span>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-xl",
          compact ? "h-[380px]" : "h-[560px] sm:h-[640px]"
        )}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, #e0f2fe 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 30% 80%, #ccfbf1 0%, transparent 50%), linear-gradient(165deg, #0b1f3a 0%, #0f2942 35%, #134e4a 100%)",
        }}
      >
        {/* stars / particles */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-white"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                opacity: 0.2 + (i % 5) * 0.12,
              }}
            />
          ))}
        </div>

        <svg
          viewBox="0 0 100 100"
          className="relative z-[1] h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="landPremium" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="45%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#99f6e4" />
            </linearGradient>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
            </linearGradient>
            <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="0.8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="landShadow">
              <feDropShadow dx="0" dy="0.4" stdDeviation="0.6" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Land */}
          <path
            d={VN_PATH}
            fill="url(#landPremium)"
            stroke="#e0f2fe"
            strokeWidth="0.5"
            filter="url(#landShadow)"
          />

          {/* Inner land highlight */}
          <path
            d={VN_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.15"
            opacity="0.5"
            transform="translate(0.3 0.2) scale(0.985)"
            transform-origin="50 50"
          />

          {/* Region labels on dark sea */}
          <text x="70" y="18" fontSize="2.6" fill="#7dd3fc" fontWeight="800" letterSpacing="0.05">
            BẮC · 38%
          </text>
          <text x="70" y="22.5" fontSize="1.9" fill="#bae6fd" fontWeight="600">
            {fmt(REGION_CAPS.north.cap100)} xe
          </text>
          <text x="70" y="48" fontSize="2.6" fill="#fcd34d" fontWeight="800">
            TRUNG · 22%
          </text>
          <text x="70" y="52.5" fontSize="1.9" fill="#fde68a" fontWeight="600">
            {fmt(REGION_CAPS.central.cap100)} xe
          </text>
          <text x="70" y="82" fontSize="2.6" fill="#6ee7b7" fontWeight="800">
            NAM · 40%
          </text>
          <text x="70" y="86.5" fontSize="1.9" fill="#a7f3d0" fontWeight="600">
            {fmt(REGION_CAPS.south.cap100)} xe
          </text>

          {/* Lanes + animated flow dots */}
          {laneOn &&
            LANES.map((lane, li) => {
              const from = byId.get(lane.fromId);
              const to = byId.get(lane.toId);
              if (!from || !to) return null;
              if (
                activeFilter !== "all" &&
                from.region !== activeFilter &&
                to.region !== activeFilter
              )
                return null;
              const cx = (from.x + to.x) / 2 + 10;
              const cy = (from.y + to.y) / 2;
              const pathId = `lane-${lane.id}`;
              const t = ((tick + li * 17) % 100) / 100;
              // quadratic bezier point
              const px =
                (1 - t) * (1 - t) * from.x +
                2 * (1 - t) * t * cx +
                t * t * to.x;
              const py =
                (1 - t) * (1 - t) * from.y +
                2 * (1 - t) * t * cy +
                t * t * to.y;
              const isSea = lane.mode === "sea";
              return (
                <g key={lane.id}>
                  <path
                    id={pathId}
                    d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                    fill="none"
                    stroke={isSea ? "url(#seaGrad)" : "#fbbf24"}
                    strokeWidth={isSea ? 0.55 : 0.45}
                    strokeDasharray={isSea ? "1.4 0.9" : "0.7 0.7"}
                    opacity="0.85"
                  />
                  {/* flowing cargo dot */}
                  <circle
                    cx={px}
                    cy={py}
                    r="0.75"
                    fill={isSea ? "#e0f2fe" : "#fef3c7"}
                    filter="url(#softGlow)"
                  />
                  <circle
                    cx={px}
                    cy={py}
                    r="1.4"
                    fill={isSea ? "#38bdf8" : "#f59e0b"}
                    opacity="0.25"
                  />
                </g>
              );
            })}

          {/* Warehouse nodes */}
          {nodes.map((w) => {
            const r = 1.15 + (w.cap100 / maxCap) * 2.4;
            const isH = hover === w.id || selected?.id === w.id;
            const owned = w.type === "owned";
            return (
              <g
                key={w.id}
                className="cursor-pointer"
                onMouseEnter={() => setHover(w.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => select(selected?.id === w.id ? null : w)}
                filter={isH ? "url(#softGlow)" : undefined}
              >
                {selected?.id === w.id && (
                  <circle
                    cx={w.x}
                    cy={w.y}
                    r={r + 1.2}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="0.35"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="r"
                      values={`${r + 0.6};${r + 2.4};${r + 0.6}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.7;0;0.7"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {owned ? (
                  <circle
                    cx={w.x}
                    cy={w.y}
                    r={r}
                    fill={REGION_COLOR[w.region]}
                    stroke="#fff"
                    strokeWidth="0.5"
                  />
                ) : (
                  <rect
                    x={w.x - r}
                    y={w.y - r}
                    width={r * 2}
                    height={r * 2}
                    rx={0.45}
                    fill={REGION_COLOR[w.region]}
                    fillOpacity={0.92}
                    stroke="#fff"
                    strokeWidth="0.45"
                  />
                )}
                {/* inner highlight */}
                <circle
                  cx={w.x - r * 0.25}
                  cy={w.y - r * 0.25}
                  r={r * 0.28}
                  fill="#fff"
                  opacity="0.35"
                />
                <text
                  x={w.x}
                  y={w.y - r - 1.2}
                  textAnchor="middle"
                  fontSize="1.9"
                  fontWeight="800"
                  fill="#0f172a"
                  stroke="#fff"
                  strokeWidth="0.25"
                  paintOrder="stroke"
                >
                  {w.short}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Top legend bar */}
        <div className="pointer-events-none absolute left-3 top-3 right-3 flex flex-wrap gap-2">
          <div className="rounded-xl border border-white/20 bg-slate-900/50 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur">
            Nationwide {fmt(REGION_CAPS.nationwide.cap100)} xe · Owned{" "}
            {REGION_CAPS.hvnOwned.ratio}% · Rented {REGION_CAPS.outside.ratio}%
          </div>
        </div>

        <AnimatePresence>
          {(hover || selected) && (
            <motion.div
              key={(selected || nodes.find((n) => n.id === hover))?.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-3 left-3 right-3 z-10 sm:left-auto sm:right-3 sm:w-80"
            >
              {(() => {
                const w =
                  selected ||
                  WAREHOUSES.find((x) => x.id === hover) ||
                  null;
                if (!w) return null;
                return (
                  <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur-xl">
                    <div
                      className="h-1.5 w-full"
                      style={{ background: REGION_COLOR[w.region] }}
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {REGION_LABEL[w.region]} ·{" "}
                            {w.type === "owned" ? "HVN owned" : "Rented WH"}
                          </div>
                          <div className="text-lg font-black text-slate-900">
                            {w.name}
                          </div>
                          <div className="text-xs font-medium text-slate-500">
                            {w.city}
                          </div>
                        </div>
                        <span
                          className="rounded-xl px-2.5 py-1 text-xs font-black text-white shadow"
                          style={{ background: REGION_COLOR[w.region] }}
                        >
                          {w.ratioPct}%
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 px-3 py-2">
                          <div className="text-[9px] font-bold uppercase text-slate-400">
                            Cap 100%
                          </div>
                          <div className="text-base font-black tabular-nums text-slate-900">
                            {fmt(w.cap100)}
                          </div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 px-3 py-2">
                          <div className="text-[9px] font-bold uppercase text-slate-400">
                            Cap 80%
                          </div>
                          <div className="text-base font-black tabular-nums text-slate-900">
                            {fmt(w.cap80)}
                          </div>
                        </div>
                      </div>
                      {w.note && (
                        <p className="mt-2 text-[11px] leading-snug text-slate-500">
                          {w.note}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] text-slate-400">
                        PPT BACKGROUND MC WH · Excel Rental WH
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
