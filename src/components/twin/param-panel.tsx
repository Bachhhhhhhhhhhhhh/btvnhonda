"use client";

import { useTwinStore } from "@/lib/store";
import { SliderField } from "@/components/ui/slider-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

export function ParamPanel() {
  const { params, setParam, setCost, reset } = useTwinStore();

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 text-white shadow-md">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Bảng điều khiển Twin</CardTitle>
              <CardDescription>
                Kéo — chi phí & utilization tính lại tức thì
              </CardDescription>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </CardHeader>
      <CardContent className="max-h-[calc(100vh-240px)] space-y-5 overflow-y-auto pb-6">
        <section className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
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
            hint="Rental WH!F59 = 28.495"
          />
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700 shadow-sm">
            <input
              type="checkbox"
              checked={params.useTtlCapacity}
              onChange={(e) => setParam("useTtlCapacity", e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Dùng TTL Cap (Excel) thay Fact Cap (Word)
          </label>
        </section>

        <section className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700">
            Đòn bẩy chính sách
          </h4>
          <SliderField
            label="Tỷ lệ stacking nhập khẩu"
            value={params.importStackRatio}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => setParam("importStackRatio", v)}
            hint="1.0 = stack 100% volume NK"
          />
          <SliderField
            label="Tỷ lệ chuyển residual N→S"
            value={params.transferRatio}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => setParam("transferRatio", v)}
            hint="Phần residual sau stack NK chuyển Nam"
          />
          <SliderField
            label="Xe / kiện (mix)"
            value={params.mcPerCase}
            min={2}
            max={4}
            step={0.1}
            onChange={(v) => setParam("mcPerCase", v)}
            hint="To South&Sum!X1 = 3.5"
          />
          <SliderField
            label="Kiện / container N→S"
            value={params.casesPerContainerNS}
            min={8}
            max={16}
            step={1}
            onChange={(v) => setParam("casesPerContainerNS", v)}
            hint="12 kiện → ~42 xe @ 3.5"
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
            hint="80 kiện/container S→N"
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
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
            Rate card (VND)
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
            hint="≈ sea ~350k VND/xe"
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
            label="Kho Nam / xe-tháng"
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
