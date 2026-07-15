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
import { Building2, MapPinned, Route, Warehouse } from "lucide-react";
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
    { name: "HVN owned 33%", value: REGION_CAPS.hvnOwned.cap, fill: "#1d4ed8" },
    { name: "Outside 67%", value: REGION_CAPS.outside.cap, fill: "#d97706" },
  ];

  const list = useMemo(() => {
    const rows =
      filter === "all" ? WAREHOUSES : WAREHOUSES.filter((w) => w.region === filter);
    return [...rows].sort((a, b) => b.cap100 - a.cap100);
  }, [filter]);

  return (
    <div className="space-y-6">
      <PageHero
        kicker="Network map · PPT BACKGROUND MC WH"
        title="Bản đồ mạng lưới kho & vận tải"
        subtitle="Click node xem capacity. Live cargo dots trên tuyến Sea/Truck N→S (To South&Sum). Owned tròn · Rented vuông · thuê ngoài 67%."
      >
        <div className="flex flex-wrap gap-2">
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
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === k
                  ? "bg-white text-slate-900 shadow"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
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

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="section-kicker">Interactive map</div>
            <CardTitle>Việt Nam MC WH Network</CardTitle>
            <CardDescription>
              Node size ~ capacity · Hover/click chi tiết · Dashed = Sea / dotted = Truck
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

        <div className="space-y-5 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Capacity theo vùng</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Bar dataKey="Cap 100%" radius={[6, 6, 0, 0]}>
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
            Danh sách kho{" "}
            {filter === "all" ? "toàn quốc" : REGION_LABEL[filter]}
            {selected && (
              <span className="ml-2 text-sm font-semibold text-blue-600">
                · đang chọn: {selected.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="table-dark w-full text-left text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="py-2 pr-3">Kho</th>
                <th className="pr-3">Vùng</th>
                <th className="pr-3">Loại</th>
                <th className="pr-3">Cap 100%</th>
                <th className="pr-3">Cap 80%</th>
                <th className="pr-3">Ratio</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => setSelected(w)}
                  className={`cursor-pointer transition hover:bg-slate-50 ${
                    selected?.id === w.id ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="py-2.5 pr-3 font-bold text-slate-900">{w.name}</td>
                  <td className="pr-3">
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: REGION_COLOR[w.region] }}
                    >
                      {REGION_LABEL[w.region]}
                    </span>
                  </td>
                  <td className="pr-3 text-slate-600">
                    {w.type === "owned" ? "Owned" : "Rented"}
                  </td>
                  <td className="pr-3 tabular-nums font-semibold">{fmt(w.cap100)}</td>
                  <td className="pr-3 tabular-nums">{fmt(w.cap80)}</td>
                  <td className="pr-3 tabular-nums">{w.ratioPct}%</td>
                  <td className="max-w-[200px] truncate text-xs text-slate-500">
                    {w.note || w.city}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
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
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm font-bold text-slate-900">{x.t}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
