"use client";

import { useTwinStore } from "@/lib/store";
import { SliderField } from "@/components/ui/slider-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

export function ParamPanel() {
  const { params, setParam, setCost, reset } = useTwinStore();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Bảng điều khiển Digital Twin</CardTitle>
          <p className="mt-1 text-xs text-slate-400">
            Kéo thanh trượt — chi phí & utilization tính lại tức thì
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Đặt lại
        </button>
      </CardHeader>
      <CardContent className="max-h-[calc(100vh-220px)] space-y-5 overflow-y-auto">
        <section className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-400/80">
            Diện tích & stacking
          </h4>
          <SliderField
            label="m² / xe khi unpack"
            value={params.unpackM2}
            min={1.2}
            max={2.2}
            step={0.05}
            onChange={(v) => setParam("unpackM2", v)}
            unit="m²"
            hint="Word: 1.7 · Excel North S110: 1.6"
          />
          <SliderField
            label="m² / xe khi chồng kiện"
            value={params.stackM2}
            min={0.6}
            max={1.5}
            step={0.05}
            onChange={(v) => setParam("stackM2", v)}
            unit="m²"
            hint="Đề bài: 1.0 m² · tối đa 3 tầng"
          />
          <SliderField
            label="Fact Cap miền Bắc"
            value={params.factCap}
            min={12000}
            max={25000}
            step={100}
            onChange={(v) => setParam("factCap", v)}
            unit="xe"
            hint="Rental WH!F55:Q55 = 17.680 VPC"
          />
          <SliderField
            label="TTL Cap miền Bắc"
            value={params.ttlCap}
            min={20000}
            max={40000}
            step={100}
            onChange={(v) => setParam("ttlCap", v)}
            unit="xe"
            hint="Rental WH!F59 = 28.495 (gồm open + HNM)"
          />
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={params.useTtlCapacity}
              onChange={(e) => setParam("useTtlCapacity", e.target.checked)}
              className="accent-sky-500"
            />
            Dùng TTL Cap (Excel) thay vì Fact Cap (Word) để tính vượt kho
          </label>
        </section>

        <section className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-400/80">
            Đòn bẩy chính sách
          </h4>
          <SliderField
            label="Tỷ lệ stacking nhập khẩu"
            value={params.importStackRatio}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => setParam("importStackRatio", v)}
            hint="1.0 = stack 100% volume nhập khẩu"
          />
          <SliderField
            label="Tỷ lệ chuyển residual N→S"
            value={params.transferRatio}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => setParam("transferRatio", v)}
            hint="Phần residual sau import stack chuyển vào Nam"
          />
          <SliderField
            label="Xe / kiện (mix)"
            value={params.mcPerCase}
            min={2}
            max={4}
            step={0.1}
            onChange={(v) => setParam("mcPerCase", v)}
            hint="To South&Sum!X1 = 3.5 MCs/case"
          />
          <SliderField
            label="Kiện / container N→S"
            value={params.casesPerContainerNS}
            min={8}
            max={16}
            step={1}
            onChange={(v) => setParam("casesPerContainerNS", v)}
            hint="Đề bài: 12 kiện → ~42 xe @ 3.5"
          />
          <SliderField
            label="Xe / container (Excel)"
            value={params.mcPerContainerExcel}
            min={40}
            max={50}
            step={0.1}
            onChange={(v) => setParam("mcPerContainerExcel", v)}
            hint="To South&Sum!Z1 = 46.6"
          />
          <SliderField
            label="Kiện return / container"
            value={params.casesPerContainerReturn}
            min={40}
            max={100}
            step={1}
            onChange={(v) => setParam("casesPerContainerReturn", v)}
            hint="Đề bài: 80 kiện/container S→N"
          />
          <SliderField
            label="Lead time (ngày)"
            value={params.leadTimeDays}
            min={3}
            max={14}
            step={1}
            onChange={(v) => setParam("leadTimeDays", v)}
          />
          <SliderField
            label="Free time (ngày)"
            value={params.freeTimeDays}
            min={1}
            max={7}
            step={1}
            onChange={(v) => setParam("freeTimeDays", v)}
          />
        </section>

        <section className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400/80">
            Đơn giá (VND) — Rate card Finance
          </h4>
          <SliderField
            label="Thuê ngoài Bắc / xe-tháng"
            value={params.cost.northOutsourcePerMcMonth}
            min={50000}
            max={400000}
            step={5000}
            onChange={(v) => setCost("northOutsourcePerMcMonth", v)}
          />
          <SliderField
            label="Bonus / xe vượt"
            value={params.cost.bonusPerOverMc}
            min={0}
            max={200000}
            step={5000}
            onChange={(v) => setCost("bonusPerOverMc", v)}
          />
          <SliderField
            label="Cước N→S / xe"
            value={params.cost.nsFreightPerMc}
            min={150000}
            max={700000}
            step={10000}
            onChange={(v) => setCost("nsFreightPerMc", v)}
            hint="≈ To South sea ~350k VND/xe"
          />
          <SliderField
            label="Đóng kiện nội địa / xe"
            value={params.cost.packingPerMc}
            min={0}
            max={150000}
            step={5000}
            onChange={(v) => setCost("packingPerMc", v)}
          />
          <SliderField
            label="Kho Nam incremental / xe-tháng"
            value={params.cost.southWhPerMcMonth}
            min={0}
            max={150000}
            step={5000}
            onChange={(v) => setCost("southWhPerMcMonth", v)}
          />
        </section>
      </CardContent>
    </Card>
  );
}
