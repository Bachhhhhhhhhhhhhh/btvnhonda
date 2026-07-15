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
import { Flag } from "lucide-react";

type Props = {
  showLanes?: boolean;
  filterRegion?: Region | "all";
  compact?: boolean;
  className?: string;
  onSelect?: (wh: WarehouseNode | null) => void;
};

/** Mainland Vietnam — recognizable S-curve */
const VN_MAINLAND = `
  M 28 5
  C 34 3.5, 42 4, 46 8
  C 49 11, 47 14, 45 16
  C 43 18, 44 21, 42 24
  C 40 27, 42 30, 40 33
  C 38 36, 41 39, 39 42
  C 37 45, 40 47, 42 50
  C 44 53, 43 56, 41 59
  C 39 62, 41 65, 40 68
  C 39 71, 42 74, 40 77
  C 38 80, 36 83, 33 86
  C 30 89, 26 91, 23 88
  C 20 85, 23 82, 25 79
  C 27 76, 25 73, 26 70
  C 27 67, 25 64, 27 61
  C 29 58, 27 55, 28 52
  C 29 49, 27 46, 29 43
  C 31 40, 29 37, 30 34
  C 31 31, 29 28, 30 25
  C 31 22, 29 19, 30 16
  C 31 13, 29 10, 30 8
  C 31 6.5, 30 5.5, 28 5
  Z
`;

/** Hoàng Sa cluster — northeast of central coast */
const HOANG_SA_ISLANDS: { x: number; y: number; r: number }[] = [
  { x: 70, y: 34, r: 0.55 },
  { x: 72.5, y: 35.5, r: 0.7 },
  { x: 74, y: 33.5, r: 0.45 },
  { x: 71.2, y: 37, r: 0.5 },
  { x: 73.5, y: 37.5, r: 0.4 },
  { x: 75.5, y: 35, r: 0.35 },
  { x: 69.5, y: 36.2, r: 0.3 },
];

/** Trường Sa cluster — southeast */
const TRUONG_SA_ISLANDS: { x: number; y: number; r: number }[] = [
  { x: 66, y: 66, r: 0.45 },
  { x: 68.5, y: 67.5, r: 0.6 },
  { x: 70, y: 65.5, r: 0.4 },
  { x: 67, y: 69.5, r: 0.5 },
  { x: 69.5, y: 70, r: 0.35 },
  { x: 71.5, y: 68, r: 0.3 },
  { x: 65.5, y: 68.2, r: 0.28 },
  { x: 72, y: 71, r: 0.32 },
];

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
    const t = setInterval(() => setTick((x) => (x + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  const activeFilter = filterRegion !== "all" ? filterRegion : localFilter;

  const nodes = useMemo(() => {
    const base =
      activeFilter === "all"
        ? WAREHOUSES
        : activeFilter === "east_sea"
          ? WAREHOUSES.filter((w) => w.region === "east_sea")
          : WAREHOUSES.filter(
              (w) => w.region === activeFilter || w.region === "east_sea"
            );
    return base;
  }, [activeFilter]);

  const warehousesOnly = useMemo(
    () => nodes.filter((w) => w.type !== "sovereignty"),
    [nodes]
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

  const maxCap = Math.max(
    ...WAREHOUSES.filter((w) => w.type !== "sovereignty").map((w) => w.cap100),
    1
  );

  return (
    <div className={cn("relative", className)}>
      {/* Bank-style toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setLaneOn((v) => !v)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs font-bold transition",
            laneOn
              ? "border-[#0a1628] bg-[#0a1628] text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          )}
        >
          {laneOn ? "Tuyến N→S: Bật" : "Tuyến N→S: Tắt"}
        </button>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["all", "Toàn quốc"],
              ["north", "Bắc"],
              ["central", "Trung"],
              ["south", "Nam"],
              ["east_sea", "Hoàng Sa · Trường Sa"],
            ] as const
          ).map(([k, lab]) => (
            <button
              type="button"
              key={k}
              onClick={() => setLocalFilter(k)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[10px] font-bold transition",
                activeFilter === k
                  ? "bg-[#0a1628] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {lab}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-600">
          <span className="rounded border border-slate-200 bg-white px-2 py-1">
            Transfer Twin: {fmt(transferVol)} xe
          </span>
          <span className="rounded border border-slate-200 bg-white px-2 py-1">
            {fmt(nsCont)} cont/năm
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0c4a6e]" /> Owned
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#b45309]" /> Rented
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c4a35a]" /> HS · TS
          </span>
        </div>
      </div>

      {/* 3D floating stage */}
      <div
        className={cn(
          "map-stage relative",
          compact ? "h-[400px]" : "h-[580px] sm:h-[660px]"
        )}
      >
        <div className="map-base-shadow" />
        <div
          className={cn(
            "map-float relative z-[1] h-full w-full overflow-hidden rounded-2xl border border-[#1a3355]"
          )}
          style={{
            background:
              "linear-gradient(160deg, #0a1628 0%, #0f2847 40%, #0c3d4a 100%)",
          }}
        >
          {/* subtle grid like bank dashboard */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <svg
            viewBox="0 0 100 100"
            className="relative z-[1] h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="landBank" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#d4e4d0" />
                <stop offset="50%" stopColor="#b8d4b0" />
                <stop offset="100%" stopColor="#9fc49a" />
              </linearGradient>
              <linearGradient id="islandGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e8d5a3" />
                <stop offset="100%" stopColor="#c4a35a" />
              </linearGradient>
              <filter id="land3d">
                <feDropShadow
                  dx="0.3"
                  dy="0.8"
                  stdDeviation="0.5"
                  floodColor="#000"
                  floodOpacity="0.4"
                />
              </filter>
              <filter id="nodeGlow">
                <feDropShadow
                  dx="0"
                  dy="0.3"
                  stdDeviation="0.35"
                  floodColor="#000"
                  floodOpacity="0.35"
                />
              </filter>
              <linearGradient id="routeSea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Sea label */}
            <text
              x="82"
              y="52"
              fontSize="2.2"
              fill="#64748b"
              fontWeight="600"
              letterSpacing="0.15"
              opacity="0.7"
            >
              BIỂN ĐÔNG
            </text>

            {/* Mainland */}
            <path
              d={VN_MAINLAND}
              fill="url(#landBank)"
              stroke="#e8eef4"
              strokeWidth="0.45"
              filter="url(#land3d)"
            />

            {/* Region captions */}
            <text x="12" y="18" fontSize="2.3" fill="#94a3b8" fontWeight="700">
              BẮC
            </text>
            <text x="12" y="21.5" fontSize="1.7" fill="#64748b">
              {fmt(REGION_CAPS.north.cap100)} xe
            </text>
            <text x="12" y="42" fontSize="2.3" fill="#94a3b8" fontWeight="700">
              TRUNG
            </text>
            <text x="12" y="45.5" fontSize="1.7" fill="#64748b">
              {fmt(REGION_CAPS.central.cap100)} xe
            </text>
            <text x="12" y="78" fontSize="2.3" fill="#94a3b8" fontWeight="700">
              NAM
            </text>
            <text x="12" y="81.5" fontSize="1.7" fill="#64748b">
              {fmt(REGION_CAPS.south.cap100)} xe
            </text>

            {/* ── Hoàng Sa ── */}
            <g>
              {/* dashed sovereignty box */}
              <rect
                x="67"
                y="31"
                width="12"
                height="9"
                rx="0.8"
                fill="rgba(196,163,90,0.08)"
                stroke="#c4a35a"
                strokeWidth="0.25"
                strokeDasharray="0.6 0.4"
              />
              {HOANG_SA_ISLANDS.map((p, i) => (
                <circle
                  key={`hs-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill="url(#islandGold)"
                  stroke="#fff"
                  strokeWidth="0.15"
                  filter="url(#nodeGlow)"
                />
              ))}
              <text
                x="73"
                y="30"
                textAnchor="middle"
                fontSize="2"
                fontWeight="800"
                fill="#e8d5a3"
              >
                HOÀNG SA
              </text>
              <text
                x="73"
                y="41.5"
                textAnchor="middle"
                fontSize="1.35"
                fill="#94a3b8"
              >
                Việt Nam
              </text>
            </g>

            {/* ── Trường Sa ── */}
            <g>
              <rect
                x="63"
                y="63"
                width="12.5"
                height="10.5"
                rx="0.8"
                fill="rgba(196,163,90,0.08)"
                stroke="#c4a35a"
                strokeWidth="0.25"
                strokeDasharray="0.6 0.4"
              />
              {TRUONG_SA_ISLANDS.map((p, i) => (
                <circle
                  key={`ts-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill="url(#islandGold)"
                  stroke="#fff"
                  strokeWidth="0.15"
                  filter="url(#nodeGlow)"
                />
              ))}
              <text
                x="69.5"
                y="62"
                textAnchor="middle"
                fontSize="2"
                fontWeight="800"
                fill="#e8d5a3"
              >
                TRƯỜNG SA
              </text>
              <text
                x="69.5"
                y="75"
                textAnchor="middle"
                fontSize="1.35"
                fill="#94a3b8"
              >
                Việt Nam
              </text>
            </g>

            {/* Routes */}
            {laneOn &&
              LANES.map((lane, li) => {
                const from = byId.get(lane.fromId);
                const to = byId.get(lane.toId);
                if (!from || !to) return null;
                if (
                  activeFilter !== "all" &&
                  activeFilter !== "east_sea" &&
                  from.region !== activeFilter &&
                  to.region !== activeFilter
                )
                  return null;
                const cx = (from.x + to.x) / 2 + 8;
                const cy = (from.y + to.y) / 2;
                const t = ((tick + li * 19) % 100) / 100;
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
                      d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                      fill="none"
                      stroke={isSea ? "url(#routeSea)" : "#c4a35a"}
                      strokeWidth={isSea ? 0.4 : 0.35}
                      strokeDasharray={isSea ? "1.2 0.7" : "0.55 0.55"}
                      opacity="0.75"
                    />
                    <circle
                      cx={px}
                      cy={py}
                      r="0.65"
                      fill={isSea ? "#e0f2fe" : "#fef3c7"}
                    />
                  </g>
                );
              })}

            {/* Warehouse nodes */}
            {warehousesOnly.map((w) => {
              const r = 1.05 + (w.cap100 / maxCap) * 2.1;
              const isH = hover === w.id || selected?.id === w.id;
              const owned = w.type === "owned";
              return (
                <g
                  key={w.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover(w.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => select(selected?.id === w.id ? null : w)}
                  filter={isH ? "url(#nodeGlow)" : undefined}
                >
                  {selected?.id === w.id && (
                    <circle
                      cx={w.x}
                      cy={w.y}
                      r={r + 1.1}
                      fill="none"
                      stroke="#c4a35a"
                      strokeWidth="0.3"
                    >
                      <animate
                        attributeName="r"
                        values={`${r + 0.5};${r + 2};${r + 0.5}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0;0.8"
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
                      strokeWidth="0.4"
                    />
                  ) : (
                    <rect
                      x={w.x - r}
                      y={w.y - r}
                      width={r * 2}
                      height={r * 2}
                      rx={0.35}
                      fill={REGION_COLOR[w.region]}
                      stroke="#fff"
                      strokeWidth="0.35"
                    />
                  )}
                  <text
                    x={w.x}
                    y={w.y - r - 1}
                    textAnchor="middle"
                    fontSize="1.75"
                    fontWeight="700"
                    fill="#0a1628"
                    stroke="#fff"
                    strokeWidth="0.3"
                    paintOrder="stroke"
                  >
                    {w.short}
                  </text>
                </g>
              );
            })}

            {/* Clickable sovereignty markers */}
            {WAREHOUSES.filter((w) => w.type === "sovereignty").map((w) => {
              const show =
                activeFilter === "all" ||
                activeFilter === "east_sea" ||
                activeFilter === "central" ||
                activeFilter === "south";
              if (!show) return null;
              return (
                <g
                  key={w.id}
                  className="cursor-pointer"
                  onClick={() => select(selected?.id === w.id ? null : w)}
                  onMouseEnter={() => setHover(w.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle
                    cx={w.x}
                    cy={w.y}
                    r="1.8"
                    fill="none"
                    stroke="#c4a35a"
                    strokeWidth="0.25"
                    opacity="0.01"
                  />
                </g>
              );
            })}
          </svg>

          {/* Top bar — bank style */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between border-b border-white/10 bg-[#0a1628]/70 px-4 py-2 backdrop-blur">
            <div className="flex items-center gap-2 text-[11px] font-bold text-white">
              <Flag className="h-3.5 w-3.5 text-[#c4a35a]" />
              Cộng hòa XHCN Việt Nam · Bản đồ logistics nội địa
            </div>
            <div className="text-[10px] font-semibold text-slate-300">
              Nationwide {fmt(REGION_CAPS.nationwide.cap100)} xe · Owned{" "}
              {REGION_CAPS.hvnOwned.ratio}% · Rented {REGION_CAPS.outside.ratio}%
            </div>
          </div>

          {/* Detail card */}
          <AnimatePresence>
            {(hover || selected) && (
              <motion.div
                key={(selected || nodes.find((n) => n.id === hover))?.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute bottom-3 left-3 right-3 z-10 sm:left-auto sm:right-3 sm:w-80"
              >
                {(() => {
                  const w =
                    selected ||
                    WAREHOUSES.find((x) => x.id === hover) ||
                    null;
                  if (!w) return null;
                  const isSov = w.type === "sovereignty";
                  return (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                      <div
                        className="h-1 w-full"
                        style={{
                          background: isSov
                            ? "#c4a35a"
                            : REGION_COLOR[w.region],
                        }}
                      />
                      <div className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {REGION_LABEL[w.region]}
                          {!isSov &&
                            ` · ${w.type === "owned" ? "HVN owned" : "Rented"}`}
                          {isSov && " · Lãnh thổ Việt Nam"}
                        </div>
                        <div className="text-base font-bold text-[#0a1628]">
                          {w.name}
                        </div>
                        <div className="text-xs text-slate-500">{w.city}</div>
                        {!isSov ? (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded border border-slate-100 bg-slate-50 px-2.5 py-2">
                              <div className="text-[9px] font-bold uppercase text-slate-400">
                                Cap 100%
                              </div>
                              <div className="text-sm font-bold tabular-nums text-[#0a1628]">
                                {fmt(w.cap100)} xe
                              </div>
                            </div>
                            <div className="rounded border border-slate-100 bg-slate-50 px-2.5 py-2">
                              <div className="text-[9px] font-bold uppercase text-slate-400">
                                Cap 80%
                              </div>
                              <div className="text-sm font-bold tabular-nums text-[#0a1628]">
                                {fmt(w.cap80)} xe
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 rounded border border-[#e8d5a3] bg-[#faf6eb] px-3 py-2 text-xs font-semibold text-[#7a6230]">
                            Quần đảo thuộc chủ quyền Việt Nam — hiển thị trên
                            bản đồ logistics quốc gia
                          </div>
                        )}
                        {w.note && !isSov && (
                          <p className="mt-2 text-[11px] text-slate-500">
                            {w.note}
                          </p>
                        )}
                        <p className="mt-2 text-[10px] text-slate-400">
                          Nguồn: PPT BACKGROUND MC WH · Excel Rental WH
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
    </div>
  );
}
