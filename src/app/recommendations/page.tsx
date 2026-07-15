"use client";

import { useTwinStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmt, fmtPct } from "@/lib/utils";

export default function RecommendationsPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const unitAvoided = params.cost.northOutsourcePerMcMonth + params.cost.bonusPerOverMc;
  const unitTransfer =
    params.cost.packingPerMc +
    params.cost.nsFreightPerMc +
    params.cost.southWhPerMcMonth +
    params.cost.returnPerCase / params.mcPerCase;

  const redMonths = result.months
    .filter((m) => m.classification === "red")
    .map((m) => m.month)
    .join(", ");

  const recs = [
    {
      title: "1. Triển khai stacking nhập khẩu như baseline",
      body: `Stack NK mang lại ${fmt(a.importRelief)} xe-tương đương capacity mỗi năm ở cài đặt hiện tại (tỷ lệ ${fmtPct(params.importStackRatio, 0)}). PPT ước ~3 tỷ VND/năm; Excel budget line −2,62 tỷ. Đây là đòn bẩy ít tranh cãi nhất — pilot SOP, claim window và layout trước (playbook Word 0–4 tuần).`,
    },
    {
      title: "2. Coi zero thuê ngoài Bắc là benchmark kỹ thuật, không phải KPI tuyệt đối",
      body: `Chuyển 100% residual đòi hỏi quy mô container rất lớn. Tối ưu kinh tế giữ z_t > 0 khi đơn giá transfer (${fmt(unitTransfer)} VND) vượt đơn giá tránh được (${fmt(unitAvoided)} VND).`,
    },
    {
      title: "3. Pre-book tháng đỏ từ T-4",
      body: `Tháng residual ≥ 30.000 sau stack NK: ${redMonths || "không có với chính sách hiện tại"}. Kích hoạt review Procurement/Transport trước peak — không chờ khi stock đã vượt.`,
    },
    {
      title: "4. Sizing case pool theo chu kỳ reverse logistics",
      body: `Case pool đỉnh ≈ ${fmt(a.peakCasePool)} kiện với LT ${params.leadTimeDays}n + free ${params.freeTimeDays}n. Thiếu kiện rỗng làm đứt kế hoạch dù có container.`,
    },
    {
      title: "5. Khóa rate card Finance trước cam kết ngân sách",
      body: `Savings ${fmt(a.totalSavings / 1e9, 2)} tỷ VND và ROI ${fmtPct(a.roi)} nhạy với đơn giá. Xác nhận thuê ngoài Bắc, bonus, đóng kiện, cước N–S, return và kho Nam incremental (Word §15).`,
    },
    {
      title: "6. Chạy Digital Twin hàng tuần trong mùa cao điểm",
      body: `Dùng DSS như control tower S&OP: cập nhật forecast tồn, chạy lại transfer ratio, phát hành nhu cầu container/case cho Transportation và Warehouse.`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Khuyến nghị điều hành</h1>
        <p className="mt-1 text-sm text-slate-400">
          Playbook Senior Business Manager — tính lại theo tham số Twin sống.
        </p>
      </div>
      <div className="space-y-3">
        {recs.map((r, i) => (
          <Card key={r.title} hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-bold text-sky-300">
                  {i + 1}
                </span>
                {r.title.replace(/^\d+\.\s*/, "")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-300">
              {r.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
