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

import "leaflet/dist/leaflet.css";

/** GitHub Pages basePath (empty on localhost) */
function assetUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Region palette (id_region từ vdporiginals/vietnam_geo) */
const REGION_STYLE: Record<string, { fill: string; stroke: string }> = {
  "2": { fill: "#bfdbfe", stroke: "#1e40af" }, // Đông Bắc
  "3": { fill: "#93c5fd", stroke: "#1d4ed8" }, // Tây Bắc
  "4": { fill: "#a5b4fc", stroke: "#4338ca" }, // Đồng bằng sông Hồng
  "5": { fill: "#99f6e4", stroke: "#0f766e" }, // Bắc Trung Bộ
  "6": { fill: "#6ee7b7", stroke: "#047857" }, // Duyên hải Nam Trung
  "7": { fill: "#fde68a", stroke: "#b45309" }, // Tây Nguyên
  "8": { fill: "#fdba74", stroke: "#c2410c" }, // Đông Nam Bộ
  "9": { fill: "#fca5a5", stroke: "#b91c1c" }, // Đồng bằng sông Cửu Long
};

const DEFAULT_PROV = { fill: "#cbd5e1", stroke: "#475569" };
const ISLAND_STYLE: PathOptions = {
  color: "#c4a35a",
  weight: 2,
  fillColor: "#f5e6b8",
  fillOpacity: 0.75,
  opacity: 1,
};

function provinceStyle(feature?: Feature<Geometry, Record<string, unknown>>): PathOptions {
  const id = String(feature?.properties?.id_region ?? "");
  const s = REGION_STYLE[id] ?? DEFAULT_PROV;
  return {
    color: s.stroke,
    weight: 0.9,
    fillColor: s.fill,
    fillOpacity: 0.42,
    opacity: 0.9,
  };
}

function makeIcon(color: string, label: string, kind: "circle" | "square" | "star") {
  const size = 28;
  const shape =
    kind === "star"
      ? `<polygon points="14,3 17,11 26,11 19,16 21,25 14,20 7,25 9,16 2,11 11,11" fill="${color}" stroke="#fff" stroke-width="1.5"/>`
      : kind === "square"
        ? `<rect x="5" y="5" width="18" height="18" rx="3" fill="${color}" stroke="#fff" stroke-width="2"/>`
        : `<circle cx="14" cy="14" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>`;

  const html = `
    <div style="position:relative;width:${size}px;height:${size + 14}px;text-align:center">
      <svg width="${size}" height="${size}" viewBox="0 0 28 28">${shape}</svg>
      <div style="
        position:absolute;left:50%;transform:translateX(-50%);
        bottom:0;font:700 9px/1 'Be Vietnam Pro',system-ui,sans-serif;
        color:#0a1628;background:#fff;border:1px solid #d8dee8;
        border-radius:3px;padding:1px 4px;white-space:nowrap;
        box-shadow:0 1px 3px rgba(0,0,0,.15)
      ">${label}</div>
    </div>`;

  return L.divIcon({
    className: "bank-map-marker",
    html,
    iconSize: [size, size + 14],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const ICONS = {
  owned: (label: string) => makeIcon("#0c4a6e", label, "circle"),
  rented: (label: string) => makeIcon("#b45309", label, "square"),
  sovereignty: (label: string) => makeIcon("#c4a35a", label, "star"),
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
      t.setStyle({ weight: 2, fillOpacity: 0.65 });
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

  const height = compact ? 420 : 620;
  const showMainland = filterRegion !== "east_sea";
  const showIslands = filterRegion === "all" || filterRegion === "east_sea";

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-slate-300 shadow-lg"
      style={{ height }}
    >
      {/* Bank chrome bar */}
      <div className="absolute left-0 right-0 top-0 z-[1000] flex items-center justify-between border-b border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-semibold text-[#0a1628] backdrop-blur">
        <span>
          Bản đồ GIS Việt Nam · 63 tỉnh/TP + Hoàng Sa & Trường Sa
          {geoLoading ? " · đang tải ranh giới…" : ""}
          {geoError ? ` · lỗi: ${geoError}` : ""}
        </span>
        <span className="hidden text-slate-500 sm:inline">
          Twin: {fmt(transferVol)} xe N→S · {fmt(nsCont)} cont/năm
        </span>
      </div>

      <MapContainer
        center={VN_MAP_CENTER}
        zoom={6}
        minZoom={5}
        maxZoom={14}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#d4e4f0" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · ranh giới: <a href="https://github.com/vdporiginals/vietnam_geo">vdporiginals/vietnam_geo</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                  color: isSea ? "#0c4a6e" : "#c4a35a",
                  weight: isSea ? 2.5 : 2,
                  dashArray: isSea ? "10 8" : "4 6",
                  opacity: 0.85,
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
      <div className="absolute bottom-3 left-3 z-[1000] max-w-[220px] rounded-md border border-slate-200 bg-white/95 p-2.5 text-[10px] font-semibold text-slate-700 shadow-md backdrop-blur">
        <div className="mb-1 font-bold uppercase tracking-wide text-slate-400">
          Chú giải
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0c4a6e]" /> HVN owned
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#b45309]" /> Kho thuê
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#c4a35a]" /> Hoàng Sa · Trường Sa
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3 rounded-sm bg-[#93c5fd]/opacity-70 ring-1 ring-[#1d4ed8]" /> Ranh giới tỉnh (GeoJSON)
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#0c4a6e]" /> Tuyến Sea
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dotted border-[#c4a35a]" /> Tuyến Truck
        </div>
        <div className="mt-1.5 border-t border-slate-100 pt-1 text-[9px] font-medium leading-snug text-slate-400">
          Nguồn ranh giới mở: github.com/vdporiginals/vietnam_geo · nền OSM
        </div>
      </div>
    </div>
  );
}
