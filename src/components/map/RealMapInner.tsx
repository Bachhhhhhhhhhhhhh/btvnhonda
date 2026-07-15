"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  Tooltip,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L, { type PathOptions, type Layer, type LeafletMouseEvent } from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  HOANG_SA_ISLETS,
  LANES,
  TRUONG_SA_ISLETS,
  VN_MAP_BOUNDS,
  VN_MAP_CENTER,
  WAREHOUSES,
  type Region,
  type WarehouseNode,
} from "@/lib/data/warehouseNetwork";
import { fmt } from "@/lib/utils";
import { useTwinStore } from "@/lib/store";
import { CargoPulse } from "@/components/wow/CargoPulse";

import "leaflet/dist/leaflet.css";

/** GitHub Pages basePath (empty on localhost) */
function assetUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Cool monochrome GIS fills — north→south subtle teal scale (no rainbow) */
const REGION_STYLE: Record<string, { fill: string; stroke: string }> = {
  "2": { fill: "#94a3b8", stroke: "#334155" },
  "3": { fill: "#7c9bb5", stroke: "#1e3a5f" },
  "4": { fill: "#6b9aaa", stroke: "#164e63" },
  "5": { fill: "#5a9a92", stroke: "#115e59" },
  "6": { fill: "#4f8f7a", stroke: "#134e4a" },
  "7": { fill: "#7a8f6a", stroke: "#3f6212" },
  "8": { fill: "#8a8060", stroke: "#713f12" },
  "9": { fill: "#7a7a8a", stroke: "#3730a3" },
};

const DEFAULT_PROV = { fill: "#94a3b8", stroke: "#475569" };
const ISLAND_STYLE: PathOptions = {
  color: "#a8893a",
  weight: 1.25,
  fillColor: "#d4c08a",
  fillOpacity: 0.5,
  opacity: 0.9,
};

function provinceStyle(feature?: Feature<Geometry, Record<string, unknown>>): PathOptions {
  const id = String(feature?.properties?.id_region ?? "");
  const s = REGION_STYLE[id] ?? DEFAULT_PROV;
  return {
    color: s.stroke,
    weight: 0.55,
    fillColor: s.fill,
    fillOpacity: 0.22,
    opacity: 0.7,
  };
}

function makeIcon(color: string, label: string, kind: "circle" | "square" | "star") {
  const w = 30;
  const h = 42;
  const glyph =
    kind === "star"
      ? `<path d="M15 4.5l2.4 7.2H25l-6 4.4 2.3 7.1L15 19.1l-6.3 4.1 2.3-7.1-6-4.4h7.6z" fill="${color}" stroke="#fff" stroke-width="1.4"/>`
      : kind === "square"
        ? `<rect x="7" y="6" width="16" height="16" rx="3.5" fill="${color}" stroke="#fff" stroke-width="1.8"/>`
        : `<circle cx="15" cy="14" r="9" fill="${color}" stroke="#fff" stroke-width="1.8"/>`;

  const html = `
    <div style="position:relative;width:${w}px;height:${h}px;filter:drop-shadow(0 2px 4px rgba(11,18,32,.28))">
      <svg width="${w}" height="30" viewBox="0 0 30 30" style="display:block;margin:0 auto">
        ${glyph}
      </svg>
      <div style="
        position:absolute;left:50%;transform:translateX(-50%);
        bottom:0;font:600 9px/1.1 'Be Vietnam Pro',system-ui,sans-serif;
        color:#0f172a;background:rgba(255,255,255,.96);border:1px solid #e2e8f0;
        border-radius:6px;padding:2px 5px;white-space:nowrap;
        box-shadow:0 1px 3px rgba(15,23,42,.12);letter-spacing:.01em
      ">${label}</div>
    </div>`;

  return L.divIcon({
    className: "bank-map-marker",
    html,
    iconSize: [w, h],
    iconAnchor: [w / 2, 15],
    popupAnchor: [0, -18],
  });
}

const ICONS = {
  owned: (label: string) => makeIcon("#0e4d6b", label, "circle"),
  rented: (label: string) => makeIcon("#b45309", label, "square"),
  sovereignty: (label: string) => makeIcon("#a8893a", label, "star"),
};

function FitBounds({ region }: { region: Region | "all" }) {
  const map = useMap();
  useEffect(() => {
    if (region === "east_sea") {
      // Hoàng Sa + Trường Sa + vùng biển Đông
      map.fitBounds(
        L.latLngBounds([
          [7.5, 110],
          [17.5, 118],
        ]),
        { padding: [28, 28] }
      );
      return;
    }
    if (region === "all") {
      map.fitBounds(VN_MAP_BOUNDS, { padding: [24, 24] });
      return;
    }
    const pts = WAREHOUSES.filter(
      (w) => w.region === region || w.region === "east_sea"
    ).map((w) => [w.lat, w.lng] as [number, number]);
    if (pts.length) {
      map.fitBounds(L.latLngBounds(pts).pad(0.35));
    }
  }, [map, region]);
  return null;
}

function onEachProvince(feature: Feature<Geometry, Record<string, unknown>>, layer: Layer) {
  const name = String(feature.properties?.ten_tinh ?? feature.properties?.name ?? "—");
  const code = String(feature.properties?.code ?? "");
  layer.bindTooltip(
    `<strong>${name}</strong>${code ? ` · ${code}` : ""}`,
    { sticky: true, className: "vn-geo-tooltip" }
  );
  layer.on({
    mouseover: (e: LeafletMouseEvent) => {
      const t = e.target as L.Path;
      t.setStyle({ weight: 1.5, fillOpacity: 0.42, color: "#0e4d6b" });
      t.bringToFront();
    },
    mouseout: (e: LeafletMouseEvent) => {
      const t = e.target as L.Path;
      const st = provinceStyle(feature);
      t.setStyle(st);
    },
  });
}

function onEachIsland(feature: Feature<Geometry, Record<string, unknown>>, layer: Layer) {
  const name = String(
    feature.properties?.name ?? feature.properties?.NAME_0 ?? "Quần đảo Việt Nam"
  );
  layer.bindPopup(
    `<div style="font-family:'Be Vietnam Pro',system-ui;min-width:180px">
      <div style="font-size:10px;font-weight:700;color:#7a6230;text-transform:uppercase;letter-spacing:.05em">Lãnh thổ Việt Nam</div>
      <div style="font-size:14px;font-weight:800;color:#0a1628">${name}</div>
      <div style="margin-top:6px;font-size:11px;color:#64748b">Ranh giới từ dữ liệu GIS mở · chủ quyền Việt Nam</div>
    </div>`
  );
  layer.bindTooltip(name, { sticky: true });
}

type Props = {
  filterRegion: Region | "all";
  laneOn: boolean;
  selectedId: string | null;
  onSelect: (w: WarehouseNode | null) => void;
  compact?: boolean;
};

export default function RealMapInner({
  filterRegion,
  laneOn,
  selectedId,
  onSelect,
  compact,
}: Props) {
  const transferVol = useTwinStore((s) => s.result.annual.transferVol);
  const nsCont = useTwinStore((s) => s.result.annual.nsContainersBase);

  const [provinces, setProvinces] = useState<FeatureCollection | null>(null);
  const [hoangSa, setHoangSa] = useState<FeatureCollection | null>(null);
  const [truongSa, setTruongSa] = useState<FeatureCollection | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setGeoLoading(true);
    Promise.all([
      fetch(assetUrl("/geo/vietnam-provinces.geojson")).then((r) => {
        if (!r.ok) throw new Error(`provinces ${r.status}`);
        return r.json();
      }),
      fetch(assetUrl("/geo/hoang-sa-fc.geojson")).then((r) => {
        if (!r.ok) throw new Error(`hoang-sa ${r.status}`);
        return r.json();
      }),
      fetch(assetUrl("/geo/truong-sa-fc.geojson")).then((r) => {
        if (!r.ok) throw new Error(`truong-sa ${r.status}`);
        return r.json();
      }),
    ])
      .then(([p, hs, ts]) => {
        if (cancelled) return;
        setProvinces(p);
        setHoangSa(hs);
        setTruongSa(ts);
        setGeoError(null);
      })
      .catch((e: Error) => {
        if (!cancelled) setGeoError(e.message || "Không tải được GeoJSON");
      })
      .finally(() => {
        if (!cancelled) setGeoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nodes = useMemo(() => {
    if (filterRegion === "all") return WAREHOUSES;
    if (filterRegion === "east_sea")
      return WAREHOUSES.filter((w) => w.region === "east_sea");
    return WAREHOUSES.filter(
      (w) => w.region === filterRegion || w.region === "east_sea"
    );
  }, [filterRegion]);

  const byId = useMemo(() => {
    const m = new Map(WAREHOUSES.map((w) => [w.id, w]));
    return m;
  }, []);

  const height = compact ? 440 : 640;
  const showMainland = filterRegion !== "east_sea";
  const showIslands = filterRegion === "all" || filterRegion === "east_sea";

  return (
    <div className="relative overflow-hidden" style={{ height }}>
      {/* Clean map chrome */}
      <div className="absolute left-0 right-0 top-0 z-[1000] flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220]/90 px-3.5 py-2.5 text-[11px] font-semibold text-slate-200 backdrop-blur-md">
        <span>
          <span className="text-[#c9a95a]">Việt Nam GIS</span>
          <span className="mx-1.5 text-slate-500">·</span>
          63 tỉnh · Hoàng Sa · Trường Sa
          {geoLoading ? (
            <span className="ml-1.5 text-slate-400">· tải…</span>
          ) : geoError ? (
            <span className="ml-1.5 text-rose-300">· {geoError}</span>
          ) : null}
        </span>
        <span className="hidden tabular-nums text-slate-400 sm:inline">
          {fmt(transferVol)} xe N→S · {fmt(nsCont)} cont
        </span>
      </div>

      <MapContainer
        center={VN_MAP_CENTER}
        zoom={6}
        minZoom={5}
        maxZoom={14}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#e8eef4", paddingTop: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/">CARTO</a> · ranh giới: <a href="https://github.com/vdporiginals/vietnam_geo">vietnam_geo</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <FitBounds region={filterRegion} />

        {/* 63 provinces — free GeoJSON from GitHub */}
        {showMainland && provinces && (
          <GeoJSON
            key="vn-provinces"
            data={provinces}
            style={(f) =>
              provinceStyle(f as Feature<Geometry, Record<string, unknown>>)
            }
            onEachFeature={(f, layer) =>
              onEachProvince(f as Feature<Geometry, Record<string, unknown>>, layer)
            }
          />
        )}

        {/* Hoàng Sa — free island geometry */}
        {showIslands && hoangSa && (
          <GeoJSON
            key="hoang-sa"
            data={hoangSa}
            style={() => ISLAND_STYLE}
            onEachFeature={(f, layer) =>
              onEachIsland(f as Feature<Geometry, Record<string, unknown>>, layer)
            }
          />
        )}

        {/* Trường Sa */}
        {showIslands && truongSa && (
          <GeoJSON
            key="truong-sa"
            data={truongSa}
            style={() => ISLAND_STYLE}
            onEachFeature={(f, layer) =>
              onEachIsland(f as Feature<Geometry, Record<string, unknown>>, layer)
            }
          />
        )}

        {/* Animated cargo on lanes */}
        {laneOn && <CargoPulse active={laneOn} />}

        {/* Transport lanes */}
        {laneOn &&
          LANES.map((lane) => {
            const from = byId.get(lane.fromId);
            const to = byId.get(lane.toId);
            if (!from || !to) return null;
            if (
              filterRegion !== "all" &&
              filterRegion !== "east_sea" &&
              from.region !== filterRegion &&
              to.region !== filterRegion
            )
              return null;
            const isSea = lane.mode === "sea";
            return (
              <Polyline
                key={lane.id}
                positions={[
                  [from.lat, from.lng],
                  [to.lat, to.lng],
                ]}
                pathOptions={{
                  color: isSea ? "#0e4d6b" : "#a8893a",
                  weight: isSea ? 2.25 : 1.75,
                  dashArray: isSea ? "8 7" : "3 5",
                  opacity: 0.78,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              >
                <Tooltip sticky>{lane.label}</Tooltip>
              </Polyline>
            );
          })}

        {/* Hoàng Sa islets (điểm tên đảo) */}
        {showIslands &&
          HOANG_SA_ISLETS.map((p) => (
            <CircleMarker
              key={`hs-${p.name}`}
              center={[p.lat, p.lng]}
              radius={4}
              pathOptions={{
                color: "#fff",
                weight: 1,
                fillColor: "#c4a35a",
                fillOpacity: 0.95,
              }}
            >
              <Tooltip>{p.name} · Hoàng Sa · Việt Nam</Tooltip>
            </CircleMarker>
          ))}

        {/* Trường Sa islets */}
        {showIslands &&
          TRUONG_SA_ISLETS.map((p) => (
            <CircleMarker
              key={`ts-${p.name}`}
              center={[p.lat, p.lng]}
              radius={4}
              pathOptions={{
                color: "#fff",
                weight: 1,
                fillColor: "#c4a35a",
                fillOpacity: 0.95,
              }}
            >
              <Tooltip>{p.name} · Trường Sa · Việt Nam</Tooltip>
            </CircleMarker>
          ))}

        {/* Warehouses + sovereignty hubs */}
        {nodes.map((w) => {
          const kind =
            w.type === "sovereignty"
              ? "sovereignty"
              : w.type === "owned"
                ? "owned"
                : "rented";
          return (
            <Marker
              key={w.id}
              position={[w.lat, w.lng]}
              icon={ICONS[kind](w.short)}
              eventHandlers={{
                click: () => onSelect(selectedId === w.id ? null : w),
              }}
              zIndexOffset={w.type === "sovereignty" ? 500 : 200}
            >
              <Popup>
                <div style={{ minWidth: 200, fontFamily: "Be Vietnam Pro, system-ui" }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {w.type === "sovereignty"
                      ? "Lãnh thổ Việt Nam"
                      : w.type === "owned"
                        ? "HVN Owned WH"
                        : "Rented WH"}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0a1628" }}>
                    {w.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{w.city}</div>
                  {w.type !== "sovereignty" ? (
                    <div
                      style={{
                        marginTop: 8,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          padding: "6px 8px",
                        }}
                      >
                        <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700 }}>
                          CAP 100%
                        </div>
                        <div style={{ fontWeight: 800 }}>{fmt(w.cap100)} xe</div>
                      </div>
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          padding: "6px 8px",
                        }}
                      >
                        <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700 }}>
                          CAP 80%
                        </div>
                        <div style={{ fontWeight: 800 }}>{fmt(w.cap80)} xe</div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "8px 10px",
                        background: "#faf6eb",
                        border: "1px solid #e8d5a3",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#7a6230",
                      }}
                    >
                      Quần đảo thuộc chủ quyền Việt Nam
                    </div>
                  )}
                  {w.note && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
                      {w.note}
                    </div>
                  )}
                  <div style={{ marginTop: 6, fontSize: 10, color: "#94a3b8" }}>
                    {w.lat.toFixed(3)}°N, {w.lng.toFixed(3)}°E · GIS VN
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating legend */}
      <div className="absolute bottom-3 left-3 z-[1000] max-w-[240px] rounded-xl border border-[var(--line)] bg-[var(--card)]/95 p-3.5 text-[10px] font-medium text-[var(--ink)] shadow-[var(--shadow-md)] backdrop-blur-md">
        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
          Chú giải
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0e4d6b] ring-2 ring-white" /> HVN owned
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-md bg-[#b45309] ring-2 ring-white" /> Kho thuê
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#a8893a] ring-2 ring-white" /> Hoàng Sa · Trường Sa
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-3 rounded-sm bg-slate-400/40 ring-1 ring-slate-500/40" /> Ranh giới tỉnh
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-[#0e4d6b]" /> Tuyến Sea
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-5 border-t-2 border-dotted border-[#a8893a]" /> Tuyến Truck
          </div>
        </div>
        <div className="mt-2.5 border-t border-[var(--line-soft)] pt-2 text-[9px] leading-snug text-[var(--muted)]">
          GIS: vietnam_geo · nền CARTO light
        </div>
      </div>
    </div>
  );
}
