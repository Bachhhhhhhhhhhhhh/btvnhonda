"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  REGION_CAPS,
  WAREHOUSES,
  type Region,
  type WarehouseNode,
} from "@/lib/data/warehouseNetwork";
import { fmt } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const RealMapInner = dynamic(() => import("./RealMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-500">
      Đang tải bản đồ OpenStreetMap…
    </div>
  ),
});

type Props = {
  showLanes?: boolean;
  filterRegion?: Region | "all";
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
  const [laneOn, setLaneOn] = useState(showLanes);
  const [localFilter, setLocalFilter] = useState<Region | "all">(filterRegion);
  const [selected, setSelected] = useState<WarehouseNode | null>(null);

  const activeFilter = filterRegion !== "all" ? filterRegion : localFilter;

  const handleSelect = (w: WarehouseNode | null) => {
    setSelected(w);
    onSelect?.(w);
  };

  const list = useMemo(() => {
    if (activeFilter === "all") return WAREHOUSES;
    if (activeFilter === "east_sea")
      return WAREHOUSES.filter((w) => w.region === "east_sea");
    return WAREHOUSES.filter(
      (w) => w.region === activeFilter || w.region === "east_sea"
    );
  }, [activeFilter]);

  return (
    <div className={cn("relative", className)}>
      {/* Bank toolbar */}
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
        <div className="ml-auto text-[10px] font-semibold text-slate-500">
          Nền: OpenStreetMap · {fmt(REGION_CAPS.nationwide.cap100)} xe nationwide
        </div>
      </div>

      {/* 3D floating stage around REAL map */}
      <div className="map-stage relative">
        <div className="map-base-shadow" />
        <div className="map-float relative z-[1] overflow-hidden rounded-xl">
          <RealMapInner
            filterRegion={activeFilter}
            laneOn={laneOn}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
            compact={compact}
          />
        </div>
      </div>

      {/* Detail panel below map (bank style) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selected.type === "sovereignty"
                    ? "Lãnh thổ Việt Nam"
                    : selected.type === "owned"
                      ? "HVN Owned"
                      : "Rented WH"}
                </div>
                <div className="text-lg font-bold text-[#0a1628]">
                  {selected.name}
                </div>
                <div className="text-xs text-slate-500">
                  {selected.city} · {selected.lat.toFixed(4)}°N,{" "}
                  {selected.lng.toFixed(4)}°E
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
            {selected.type !== "sovereignty" ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MiniStat label="Cap 100%" value={`${fmt(selected.cap100)} xe`} />
                <MiniStat label="Cap 80%" value={`${fmt(selected.cap80)} xe`} />
                <MiniStat label="Tỷ trọng net" value={`${selected.ratioPct}%`} />
                <MiniStat label="Mã" value={selected.short} />
              </div>
            ) : (
              <div className="mt-3 rounded border border-[#e8d5a3] bg-[#faf6eb] px-3 py-2 text-xs font-semibold text-[#7a6230]">
                {selected.note} — hiển thị đầy đủ trên bản đồ OpenStreetMap thật.
              </div>
            )}
            {selected.note && selected.type !== "sovereignty" && (
              <p className="mt-2 text-xs text-slate-500">{selected.note}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick list under map */}
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {list.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelect(w)}
              className={cn(
                "rounded border px-2 py-1 text-[10px] font-bold transition",
                selected?.id === w.id
                  ? "border-[#0a1628] bg-[#0a1628] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {w.short}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 px-2.5 py-2">
      <div className="text-[9px] font-bold uppercase text-slate-400">{label}</div>
      <div className="text-sm font-bold tabular-nums text-[#0a1628]">{value}</div>
    </div>
  );
}
