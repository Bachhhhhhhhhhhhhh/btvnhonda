"use client";

import { useTwinStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt, fmtPct } from "@/lib/utils";
import { ASSUMPTIONS } from "@/lib/data/projectData";

export default function VehiclePage() {
  const { params, result } = useTwinStore();
  const layers = ASSUMPTIONS.maxLayers;
  const densityGain = params.unpackM2 / params.stackM2;
  const effCap = params.factCap * densityGain;
  const mcPerPallet = params.mcPerCase;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Năng lực xe & mật độ lưu kho</h1>
        <p className="mt-1 text-sm text-slate-400">
          Stacking thay đổi số xe trên mỗi m² và slot capacity hiệu dụng của kho.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Mật độ unpack" value={`${fmt(1 / params.unpackM2, 2)} xe/m²`} sub={`${params.unpackM2} m²/xe`} />
        <Kpi label="Mật độ stack" value={`${fmt(1 / params.stackM2, 2)} xe/m²`} sub={`${params.stackM2} m²/xe`} tone="good" />
        <Kpi label="Hệ số tăng mật độ" value={`${fmt(densityGain, 2)}×`} sub={`Tối đa ${layers} tầng`} tone="accent" />
        <Kpi label="Fact Cap hiệu dụng" value={fmt(effCap)} sub={`từ ${fmt(params.factCap)} nếu full stack`} tone="good" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card hover>
          <CardHeader><CardTitle>Tải pallet / kiện</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>
              Đề bài: <strong className="text-white">2–4 xe/kiện</strong>, tối đa{" "}
              <strong className="text-white">{layers} tầng</strong>. Mix workbook:{" "}
              <strong className="text-sky-300">{ASSUMPTIONS.mcPerCaseMix} xe/kiện</strong>{" "}
              (To South&Sum!X1).
            </p>
            <p>
              Twin hiện tại: <strong className="text-white">{fmt(mcPerPallet, 1)}</strong> xe/kiện
            </p>
            <p>
              Container: {params.casesPerContainerNS} kiện →{" "}
              {fmt(params.casesPerContainerNS * params.mcPerCase, 1)} xe (base) so Excel{" "}
              {params.mcPerContainerExcel} xe/cont.
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardHeader><CardTitle>Hàm ý throughput</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>
              Import năm dưới tỷ lệ stack {fmtPct(params.importStackRatio, 0)}:{" "}
              <strong className="text-white">
                {fmt(result.annual.importVol * params.importStackRatio)}
              </strong>{" "}
              xe được stack.
            </p>
            <p>
              Capacity tương đương giải phóng:{" "}
              <strong className="text-emerald-300">{fmt(result.annual.importRelief)}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Lưu ý: stacking tăng mật độ lưu kho; bản thân không đổi throughput
              sản xuất/bán (Little&apos;s Law — inventory vẫn cần dòng outbound).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
