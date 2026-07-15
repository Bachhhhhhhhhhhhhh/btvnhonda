"use client";

import { useMemo, useState } from "react";
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

type Props = {
  /** Show N→S route arcs */
  showLanes?: boolean;
  /** Highlight region filter */
  filterRegion?: Region | "all";
  /** Compact height for dashboard embed */
  compact?: boolean;
  className?: string;
  onSelect?: (wh: WarehouseNode | null) => void;
};

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
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setLaneOn((v) => !v)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-bold transition",
            laneOn
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          {laneOn ? "● Tuyến N→S bật" : "○ Tuyến N→S tắt"}
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
                "rounded-full px-2.5 py-1 text-[10px] font-bold transition",
                activeFilter === k
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
        <div className="ml-auto flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />
            HVN owned
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 ring-2 ring-amber-200" />
            Rented
          </span>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 shadow-inner",
          compact ? "h-[340px]" : "h-[520px] sm:h-[580px]"
        )}
      >
        {/* Decorative sea */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(56,189,248,0.08),transparent_50%)]" />

        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="landFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="50%" stopColor="#ecfdf5" />
              <stop offset="100%" stopColor="#f0f9ff" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrowSea"
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <path d="M0,0 L4,2 L0,4 Z" fill="#2563eb" />
            </marker>
            <marker
              id="arrowTruck"
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <path d="M0,0 L4,2 L0,4 Z" fill="#d97706" />
            </marker>
          </defs>

          {/* Simplified Vietnam silhouette (stylized) */}
          <path
            d="
              M 42 8
              C 48 6, 56 7, 60 12
              C 63 16, 61 20, 58 22
              C 55 24, 56 28, 54 32
              C 52 36, 55 40, 53 44
              C 51 48, 56 50, 58 54
              C 60 58, 57 62, 55 66
              C 53 70, 56 74, 54 78
              C 52 82, 48 86, 44 90
              C 40 93, 36 94, 34 90
              C 32 86, 36 82, 38 78
              C 40 74, 38 70, 40 66
              C 42 62, 40 58, 42 54
              C 44 50, 42 46, 44 42
              C 46 38, 44 34, 46 30
              C 48 26, 44 22, 42 18
              C 40 14, 38 10, 42 8
              Z
            "
            fill="url(#landFill)"
            stroke="#94a3b8"
            strokeWidth="0.35"
            className="drop-shadow-sm"
          />

          {/* Region bands labels */}
          <text x="68" y="20" fontSize="2.4" fill="#2563eb" fontWeight="700">
            BẮC · {REGION_CAPS.north.ratio}%
          </text>
          <text x="68" y="48" fontSize="2.4" fill="#d97706" fontWeight="700">
            TRUNG · {REGION_CAPS.central.ratio}%
          </text>
          <text x="68" y="82" fontSize="2.4" fill="#059669" fontWeight="700">
            NAM · {REGION_CAPS.south.ratio}%
          </text>

          {/* Region capacity callouts */}
          <RegionBadge x={72} y={24} label={`${fmt(REGION_CAPS.north.cap100)} xe`} color="#2563eb" />
          <RegionBadge x={72} y={52} label={`${fmt(REGION_CAPS.central.cap100)} xe`} color="#d97706" />
          <RegionBadge x={72} y={86} label={`${fmt(REGION_CAPS.south.cap100)} xe`} color="#059669" />

          {/* Transport lanes */}
          {laneOn &&
            LANES.map((lane) => {
              const from = byId.get(lane.fromId);
              const to = byId.get(lane.toId);
              if (!from || !to) return null;
              if (
                filterRegion !== "all" &&
                from.region !== filterRegion &&
                to.region !== filterRegion
              )
                return null;
              const midX = (from.x + to.x) / 2 + 8;
              const midY = (from.y + to.y) / 2;
              const isSea = lane.mode === "sea";
              return (
                <g key={lane.id} opacity={0.85}>
                  <path
                    d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                    fill="none"
                    stroke={isSea ? "#2563eb" : "#d97706"}
                    strokeWidth={isSea ? 0.45 : 0.4}
                    strokeDasharray={isSea ? "1.2 0.8" : "0.6 0.6"}
                    markerEnd={isSea ? "url(#arrowSea)" : "url(#arrowTruck)"}
                  />
                </g>
              );
            })}

          {/* Warehouse nodes */}
          {nodes.map((w) => {
            const r = 1.1 + (w.cap100 / maxCap) * 2.2;
            const isH = hover === w.id || selected?.id === w.id;
            const owned = w.type === "owned";
            return (
              <g
                key={w.id}
                className="cursor-pointer"
                onMouseEnter={() => setHover(w.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => select(selected?.id === w.id ? null : w)}
                filter={isH ? "url(#glow)" : undefined}
              >
                {/* pulse ring when selected */}
                {selected?.id === w.id && (
                  <circle
                    cx={w.x}
                    cy={w.y}
                    r={r + 1.4}
                    fill="none"
                    stroke={REGION_COLOR[w.region]}
                    strokeWidth="0.35"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from={r + 0.8}
                      to={r + 2.2}
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.55"
                      to="0"
                      dur="1.4s"
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
                    strokeWidth="0.45"
                  />
                ) : (
                  <rect
                    x={w.x - r}
                    y={w.y - r}
                    width={r * 2}
                    height={r * 2}
                    rx={0.4}
                    fill={REGION_COLOR[w.region]}
                    fillOpacity={0.85}
                    stroke="#fff"
                    strokeWidth="0.4"
                  />
                )}
                <text
                  x={w.x}
                  y={w.y - r - 1.1}
                  textAnchor="middle"
                  fontSize="1.85"
                  fontWeight="700"
                  fill="#0f172a"
                >
                  {w.short}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / select card */}
        <AnimatePresence>
          {(hover || selected) && (
            <motion.div
              key={(selected || nodes.find((n) => n.id === hover))?.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-72"
            >
              {(() => {
                const w =
                  selected ||
                  WAREHOUSES.find((x) => x.id === hover) ||
                  null;
                if (!w) return null;
                return (
                  <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {REGION_LABEL[w.region]} ·{" "}
                          {w.type === "owned" ? "HVN owned" : "Rented"}
                        </div>
                        <div className="text-base font-black text-slate-900">
                          {w.name}
                        </div>
                        <div className="text-xs text-slate-500">{w.city}</div>
                      </div>
                      <span
                        className="rounded-lg px-2 py-1 text-[10px] font-bold text-white"
                        style={{ background: REGION_COLOR[w.region] }}
                      >
                        {w.ratioPct}% net
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Stat label="Cap 100%" value={`${fmt(w.cap100)} xe`} />
                      <Stat label="Cap 80%" value={`${fmt(w.cap80)} xe`} />
                    </div>
                    {w.note && (
                      <p className="mt-2 text-[11px] leading-snug text-slate-500">
                        {w.note}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-slate-400">
                      Nguồn: PPT BACKGROUND MC WH · Excel Rental WH
                    </p>
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

function RegionBadge({
  x,
  y,
  label,
  color,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y - 2.2}
        width={18}
        height={3.2}
        rx={0.6}
        fill="#fff"
        stroke={color}
        strokeWidth="0.25"
        opacity="0.95"
      />
      <text
        x={x + 9}
        y={y}
        textAnchor="middle"
        fontSize="1.7"
        fontWeight="700"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="text-sm font-black tabular-nums text-slate-900">{value}</div>
    </div>
  );
}
