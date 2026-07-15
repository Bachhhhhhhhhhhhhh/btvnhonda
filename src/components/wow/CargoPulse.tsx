"use client";

import { useEffect, useState } from "react";
import { CircleMarker, Polyline, useMap } from "react-leaflet";
import { LANES, WAREHOUSES } from "@/lib/data/warehouseNetwork";

/** Animated cargo dots sliding along transport lanes */
export function CargoPulse({ active }: { active: boolean }) {
  const [t, setT] = useState(0);
  const map = useMap();

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let start = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      setT(elapsed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Force repaint periodically
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => map.invalidateSize({ pan: false }), 4000);
    return () => clearInterval(id);
  }, [active, map]);

  if (!active) return null;

  const byId = new Map(WAREHOUSES.map((w) => [w.id, w]));

  return (
    <>
      {LANES.map((lane, li) => {
        const from = byId.get(lane.fromId);
        const to = byId.get(lane.toId);
        if (!from || !to) return null;
        // phase offset per lane
        const phase = (t * (0.12 + (li % 3) * 0.04) + li * 0.17) % 1;
        const lat = from.lat + (to.lat - from.lat) * phase;
        const lng = from.lng + (to.lng - from.lng) * phase;
        const isSea = lane.mode === "sea";
        return (
          <CircleMarker
            key={`cargo-${lane.id}`}
            center={[lat, lng]}
            radius={isSea ? 5 : 4}
            pathOptions={{
              color: "#fff",
              weight: 1.5,
              fillColor: isSea ? "#38bdf8" : "#fbbf24",
              fillOpacity: 0.95,
            }}
          />
        );
      })}
      {/* soft glow trail */}
      {LANES.filter((l) => l.mode === "sea").map((lane) => {
        const from = byId.get(lane.fromId);
        const to = byId.get(lane.toId);
        if (!from || !to) return null;
        return (
          <Polyline
            key={`glow-${lane.id}`}
            positions={[
              [from.lat, from.lng],
              [to.lat, to.lng],
            ]}
            pathOptions={{
              color: "#38bdf8",
              weight: 1,
              opacity: 0.15 + 0.1 * Math.sin(t + lane.id.length),
              dashArray: "2 14",
            }}
          />
        );
      })}
    </>
  );
}
