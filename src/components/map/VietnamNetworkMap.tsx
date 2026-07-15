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
import { MapPinned, Route } from "lucide-react";

const RealMapInner = dynamic(() => import("./RealMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] flex-col items-center justify-center gap-2 bg-[#eef2f6] text-sm font-semibold text-slate-500">
      <MapPinned className="h-6 w-6 text-[#b8954a]" />
      Đang tải bản đồ GIS Việt Nam…
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
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#eef2f6] pb-3">
        <button
          type="button"
          onClick={() => setLaneOn((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[3px] border px-3 py-1.5 text-xs font-bold transition",
            laneOn
              ? "border-[#071428] bg-[#071428] text-white"
              : "border-[#dce3ec] bg-white text-slate-700 hover:bg-slate-50"
          )}
        >
          <Route className="h-3.5 w-3.5" />
          {laneOn ? "Tuyến N→S: Bật" : "Tuyến N→S: Tắt"}
        </button>
        <div className="seg-control">
          {(
            [
              ["all", "Toàn quốc"],
              ["north", "Bắc"],
              ["central", "Trung"],
              ["south", "Nam"],
              ["east_sea", "HS · TS"],
            ] as const
          ).map(([k, lab]) => (
            <button
              type="button"
              key={k}
              onClick={() => setLocalFilter(k)}
              className={cn(activeFilter === k && "active")}
            >
              {lab}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[10px] font-semibold text-slate-500">
          GIS 63 tỉnh · HS/TS · {fmt(REGION_CAPS.nationwide.cap100)} xe nationwide
        </div>
      </div>

      {/* Map framed like bank locator */}
      <div className="map-stage relative">
        <div className="map-float relative z-[1]">
          <RealMapInner
            filterRegion={activeFilter}
            laneOn={laneOn}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
            compact={compact}
          />
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-[4px] border border-[#dce3ec] bg-white p-4 shadow-[0_1px_2px_rgba(7,20,40,0.05)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b8954a]">
                  {selected.type === "sovereignty"
                    ? "Lãnh thổ Việt Nam"
                    : selected.type === "owned"
                      ? "HVN Owned"
                      : "Rented WH"}
                </div>
                <div className="mt-0.5 text-lg font-bold text-[#071428]">
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
                className="btn-bank-outline px-2.5 py-1 text-xs"
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
              <div className="mt-3 rounded-[3px] border border-[#e8d5a3] bg-[#faf6eb] px-3 py-2 text-xs font-semibold text-[#7a6230]">
                {selected.note} — ranh giới GIS mở · chủ quyền Việt Nam.
              </div>
            )}
            {selected.note && selected.type !== "sovereignty" && (
              <p className="mt-2 text-xs text-slate-500">{selected.note}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {list.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelect(w)}
              className={cn(
                "rounded-[3px] border px-2.5 py-1 text-[10px] font-bold transition",
                selected?.id === w.id
                  ? "border-[#071428] bg-[#071428] text-white"
                  : "border-[#dce3ec] bg-white text-slate-600 hover:border-[#b0bccb]"
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
    <div className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] px-2.5 py-2">
      <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="text-sm font-bold tabular-nums text-[#071428]">{value}</div>
    </div>
  );
}
