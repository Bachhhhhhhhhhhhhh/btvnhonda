"use client";

import { useMemo, useState } from "react";
import { VietnamNetworkMap } from "@/components/map/VietnamNetworkMap";
import {
  REGION_CAPS,
  REGION_COLOR,
  REGION_LABEL,
  WAREHOUSES,
  type Region,
  type WarehouseNode,
} from "@/lib/data/warehouseNetwork";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Legend,
} from "recharts";
import { chartTheme } from "@/components/charts/theme";
import { useTwinStore } from "@/lib/store";
import { Building2, MapPinned, Route, Warehouse, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

export default function MapPage() {
  const [filter, setFilter] = useState<Region | "all">("all");
  const [selected, setSelected] = useState<WarehouseNode | null>(null);
  const { result } = useTwinStore();

  const regionBars = (["north", "central", "south"] as const).map((r) => ({
    name: REGION_LABEL[r],
    "Cap 100%": REGION_CAPS[r].cap100,
    "Cap 80%": REGION_CAPS[r].cap80,
    fill: REGION_COLOR[r],
  }));

  const ownership = [
    { name: "HVN owned 33%", value: REGION_CAPS.hvnOwned.cap, fill: "#0a4d6e" },
    { name: "Outside 67%", value: REGION_CAPS.outside.cap, fill: "#b8954a" },
  ];

  const list = useMemo(() => {
    const rows =
      filter === "all"
        ? WAREHOUSES.filter((w) => w.type !== "sovereignty")
        : WAREHOUSES.filter((w) => w.region === filter && w.type !== "sovereignty");
    return [...rows].sort((a, b) => b.cap100 - a.cap100);
  }, [filter]);

  return (
    <div className="space-y-5">
      <PageHero
        kicker="Network intelligence · GIS Việt Nam"
        title="Bản đồ mạng lưới kho & vận tải"
        subtitle="Ranh giới 63 tỉnh/thành + Hoàng Sa & Trường Sa (dữ liệu GIS mở). Click node để xem capacity — Owned tròn · Rented vuông · tuyến Sea/Truck N→S."
      >
        <div className="seg-control !bg-white/10 !border-white/15">
          {(
            [
              ["all", "Toàn quốc"],
              ["north", "Miền Bắc"],
              ["central", "Miền Trung"],
              ["south", "Miền Nam"],
            ] as const
          ).map(([k, lab]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={filter === k ? "active !bg-white !text-[#071428]" : "!text-slate-200 hover:!text-white"}
            >
              {lab}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Nationwide 100%"
          value={fmt(REGION_CAPS.nationwide.cap100)}
          sub={`80%: ${fmt(REGION_CAPS.nationwide.cap80)} xe`}
          tone="accent"
          icon={MapPinned}
        />
        <Kpi
          label="HVN owned"
          value={`${REGION_CAPS.hvnOwned.ratio}%`}
          sub={`${fmt(REGION_CAPS.hvnOwned.cap)} xe`}
          icon={Building2}
        />
        <Kpi
          label="Outside rented"
          value={`${REGION_CAPS.outside.ratio}%`}
          sub={`${fmt(REGION_CAPS.outside.cap)} xe`}
          tone="warn"
          icon={Warehouse}
        />
        <Kpi
          label="Transfer Twin (năm)"
          value={fmt(result.annual.transferVol)}
          sub={`${fmt(result.annual.nsContainersBase)} cont N→S`}
          tone="good"
          icon={Route}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3" accent>
          <CardHeader>
            <div className="section-kicker">Interactive map</div>
            <CardTitle>Việt Nam MC WH Network</CardTitle>
            <CardDescription>
              GeoJSON tỉnh/thành · Hoàng Sa / Trường Sa · marker kho HVN · tuyến vận tải live Twin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VietnamNetworkMap
              filterRegion={filter}
              showLanes
              onSelect={setSelected}
            />
          </CardContent>
        </Card>

        <div className="space-y-4 xl:col-span-2">
          <Card accent>
            <CardHeader>
              <CardTitle>Capacity theo vùng</CardTitle>
              <CardDescription>Cap 100% theo miền (PPT MC WH)</CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Bar dataKey="Cap 100%" radius={[3, 3, 0, 0]}>
                    {regionBars.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owned vs Outside</CardTitle>
              <CardDescription>PPT: high reliance on rented WH</CardDescription>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ownership}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {ownership.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTheme.tooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Danh mục kho{" "}
            {filter === "all" ? "toàn quốc" : REGION_LABEL[filter]}
            {selected && selected.type !== "sovereignty" && (
              <span className="ml-2 text-sm font-semibold text-[#0a4d6e]">
                · đang chọn: {selected.name}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Bảng tra cứu capacity — click dòng để đồng bộ với bản đồ
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Kho</th>
                <th>Vùng</th>
                <th>Loại</th>
                <th>Cap 100%</th>
                <th>Cap 80%</th>
                <th>Ratio</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {list.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => setSelected(w)}
                  className={`cursor-pointer transition ${
                    selected?.id === w.id ? "selected" : ""
                  }`}
                >
                  <td className="font-bold text-[#071428]">{w.name}</td>
                  <td>
                    <span
                      className="rounded-[2px] px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: REGION_COLOR[w.region] }}
                    >
                      {REGION_LABEL[w.region]}
                    </span>
                  </td>
                  <td className="text-slate-600">
                    {w.type === "owned" ? "Owned" : "Rented"}
                  </td>
                  <td className="tabular-nums font-semibold">{fmt(w.cap100)}</td>
                  <td className="tabular-nums">{fmt(w.cap80)}</td>
                  <td className="tabular-nums">{w.ratioPct}%</td>
                  <td className="max-w-[200px] truncate text-xs text-slate-500">
                    {w.note || w.city}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            t: "Flow N→S",
            d: "Vĩnh Phúc / Hà Nam → Long An, Đồng Nai, Cái Cui (Sea Case + Truck). Mix 3.5 xe/kiện · 46.6 xe/cont Excel.",
          },
          {
            t: "Return S→N",
            d: "Kiện rỗng quay Bắc: 80 kiện/container · lead 7n + free 3n → case pool peak theo Twin.",
          },
          {
            t: "Self-reliance",
            d: "PPT: enhance self-reliance — stacking CBU/LOG giảm thuê ngoài trước khi expand NBF/LOG2.",
          },
        ].map((x) => (
          <div
            key={x.t}
            className="rounded-[4px] border border-[#dce3ec] bg-white p-5 shadow-[0_1px_2px_rgba(7,20,40,0.05)]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b8954a]">
              {x.t}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="bank-trust">
        <ShieldCheck className="h-4 w-4 text-[#0d6b63]" />
        <div>
          <strong>Nguồn bản đồ</strong> · OpenStreetMap + GeoJSON mở vdporiginals/vietnam_geo
          (63 tỉnh, Hoàng Sa, Trường Sa)
        </div>
        <div className="ml-auto">Chỉ phục vụ mô hình DSS nội bộ</div>
      </div>
    </div>
  );
}
