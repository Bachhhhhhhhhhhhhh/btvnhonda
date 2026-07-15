"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SOURCES, ASSUMPTIONS, totalImport } from "@/lib/data/projectData";
import { SectionHeader, InsightBox, MetricRow } from "@/components/ui/section-header";
import { Kpi } from "@/components/ui/kpi";
import { fmt, fmtPct } from "@/lib/utils";
import { useTwinStore } from "@/lib/store";
import {
  BookOpen,
  ArrowRight,
  Network,
  Layers,
  Ship,
  Landmark,
} from "lucide-react";

const MODULES = [
  { href: "/warehouse", t: "Năng lực kho", d: "Fact vs TTL · stock peak · util" },
  { href: "/import", t: "Nhập khẩu", d: "Stack NK · relief · m²" },
  { href: "/domestic", t: "Nội địa", d: "y_t / z_t · break-even" },
  { href: "/container", t: "Container", d: "N→S · return · case pool" },
  { href: "/transport", t: "Vận tải", d: "Lane cost · lead/free" },
  { href: "/financial", t: "Tài chính", d: "ROI · NPV · rate card" },
  { href: "/scenarios", t: "Kịch bản", d: "As-is → zero OS" },
  { href: "/sensitivity", t: "Độ nhạy", d: "Tornado ±20%" },
  { href: "/monte-carlo", t: "Monte Carlo", d: "P10–P90 savings" },
  { href: "/risk", t: "Rủi ro", d: "Register L×S" },
  { href: "/map", t: "Bản đồ", d: "GIS 63 tỉnh · HS/TS" },
  { href: "/digital-twin", t: "Digital Twin", d: "Control tower sống" },
];

export default function OverviewPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const reliefRate = (params.unpackM2 - params.stackM2) / params.unpackM2;

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Dự án · Context"
        title="Tổng quan dự án"
        subtitle="Honda Việt Nam MC Logistics — tối ưu stacking & thuê ngoài kho miền Bắc (Trương Thế Bách / OM029354). DSS kết nối Word · Excel 103Ki 2QFC · PPT Yamagomori."
        actions={
          <Link href="/digital-twin" className="btn-bank-gold inline-flex items-center gap-1.5 px-3 py-2 text-xs">
            Mở Digital Twin
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Import năm" value={fmt(totalImport())} sub="Excel master" tone="accent" icon={Layers} />
        <Kpi label="Fact Cap Bắc" value={fmt(ASSUMPTIONS.factCapNorth)} sub="Word baseline" icon={BookOpen} />
        <Kpi label="Tiết kiệm Twin" value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`} tone="good" icon={Landmark} />
        <Kpi label="Relief rate" value={fmtPct(reliefRate)} sub="capacity eq / import" icon={Network} />
      </div>

      <MetricRow
        items={[
          { label: "Nationwide cap", value: fmt(ASSUMPTIONS.nationwideCap100), hint: "100%" },
          { label: "HVN owned", value: "33%", hint: fmt(ASSUMPTIONS.hvnOwnedCap) },
          { label: "Outside rented", value: "67%", hint: fmt(ASSUMPTIONS.outsideCap) },
          { label: "CBU WH m²", value: fmt(ASSUMPTIONS.cbuWhM2), hint: "PPT" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" accent>
          <CardHeader>
            <div className="section-kicker">Business problem</div>
            <CardTitle>Bài toán kinh doanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              Mùa cao điểm, kho xe máy miền Bắc vượt capacity hữu dụng, phát sinh thuê kho ngoài,
              bonus, tăng ca và nghẽn vận hành. Giải pháp: lưu xe theo kiện chồng (stacking) thay vì
              unpack ngay — giải phóng sàn mà chưa cần mở rộng kho sở hữu.
            </p>
            <p>
              <strong className="text-[#0a4d6e]">Nhánh nhập khẩu:</strong> hàng NK dạng kiện, chồng
              tối đa {ASSUMPTIONS.maxLayers} tầng (2–4 xe/kiện). Footprint {ASSUMPTIONS.unpackM2} →{" "}
              {ASSUMPTIONS.stackM2} m²/xe — relief ~{fmtPct(reliefRate)} capacity theo xe.
            </p>
            <p>
              <strong className="text-[#5b21b6]">Nhánh nội địa:</strong> stacking không miễn phí —
              đóng kiện, bốc xếp, rủi ro, transfer Nam so với thuê ngoài Bắc theo{" "}
              <em>tổng chi phí mạng lưới</em>. Biến: x_t (stack), y_t (transfer), z_t (outsource).
            </p>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle>Tài liệu nguồn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#b8954a]">Word</div>
              <div className="mt-1 text-[13px] text-slate-700">{SOURCES.word}</div>
            </div>
            <div className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#b8954a]">Excel</div>
              <div className="mt-1 text-[13px] text-slate-700">{SOURCES.excel}</div>
              <div className="mt-1 text-xs text-slate-500">25 sheet · 103Ki 2QFC Jun</div>
            </div>
            <div className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#b8954a]">PowerPoint</div>
              <div className="mt-1 text-[13px] text-slate-700">{SOURCES.ppt}</div>
              <div className="mt-1 text-xs text-slate-500">Slide 17/30 & 19/30</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card hover>
          <CardHeader>
            <CardTitle>Luồng stacking (PPT 19/30)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Import → Stock In</li>
              <li>Chụp ảnh VIN/ENG (còn trong kiện)</li>
              <li>
                <strong className="text-teal-800">Lưu kho chồng kiện</strong> (giảm m² thuê)
              </li>
              <li>Thông quan</li>
              <li>Unpack khi cần giao</li>
              <li>Giao đại lý</li>
            </ol>
            <p className="mt-4 rounded-[3px] border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              Unpack trễ có thể ảnh hưởng claim NSX — RACI rõ với Genpo / QA.
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardHeader>
            <CardTitle>Bối cảnh mạng lưới (PPT 17/30)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            <ul className="space-y-2">
              <li>Toàn quốc 100%: {fmt(ASSUMPTIONS.nationwideCap100)} xe</li>
              <li>Bắc 100%: {fmt(ASSUMPTIONS.northCap100)} (38%)</li>
              <li>Trung 100%: {fmt(ASSUMPTIONS.centralCap100)} (22%)</li>
              <li>Nam 100%: {fmt(ASSUMPTIONS.southCap100)} (40%)</li>
              <li>HVN sở hữu 33% · Thuê ngoài 67%</li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Phụ thuộc cao kho thuê — stacking tăng tự chủ trước expand NBF/LOG2.
            </p>
          </CardContent>
        </Card>
      </div>

      <InsightBox title="Live Twin snapshot" tone="info">
        Stack {fmtPct(params.importStackRatio, 0)} · Transfer {fmtPct(params.transferRatio, 0)} ·
        Outsource {fmt(a.outsourceVol)} · Cont {fmt(a.nsContainersBase)} · ROI {fmtPct(a.roi)}.
        Mọi module bên dưới đọc cùng store Zustand.
      </InsightBox>

      <Card accent>
        <CardHeader>
          <div className="section-kicker">Module map</div>
          <CardTitle>Điều hướng chức năng</CardTitle>
          <CardDescription>Mỗi tab đã nâng cấp chi tiết — KPI, chart, bảng, insight</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MODULES.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group rounded-[3px] border border-[#dce3ec] bg-white p-3 transition hover:border-[#b8954a]/50 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#071428]">{m.t}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#b8954a]" />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{m.d}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { icon: Layers, t: "Nhánh 1", d: "Stack NK — baseline benefit rõ, ít tranh cãi." },
          { icon: Ship, t: "Nhánh 2", d: "Transfer chọn lọc khi unit economics dương." },
          { icon: Network, t: "Twin", d: "Không tối ưu z_t=0 bằng mọi giá — tối ưu network cost." },
        ].map((x) => (
          <div key={x.t} className="flex gap-3 rounded-[4px] border border-[#dce3ec] bg-white p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-[#071428] text-white">
              <x.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#071428]">{x.t}</div>
              <p className="mt-0.5 text-xs text-slate-600">{x.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
