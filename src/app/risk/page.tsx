import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RISKS = [
  {
    risk: "Claim unpack trễ",
    impact: "Phát hiện lỗi muộn; khó claim NSX",
    likelihood: "Trung bình",
    severity: "Cao",
    control: "Cửa sổ inspection, tỷ lệ sampling, RACI Logistics/QA/Genpo/Import",
  },
  {
    risk: "Nghẽn container",
    impact: "Kế hoạch zero-outsource thất bại ở peak",
    likelihood: "Cao",
    severity: "Cao",
    control: "Book theo rolling forecast + buffer container + cut-off tuần",
  },
  {
    risk: "Thiếu case pool",
    impact: "Kiện rỗng trễ → đứt packing/transfer",
    likelihood: "Trung bình",
    severity: "Cao",
    control: "Sizing pool chu kỳ 10 ngày; theo dõi lead time thực tế",
  },
  {
    risk: "Nghẽn kho Nam",
    impact: "Chỉ chuyển chi phí Bắc → Nam",
    likelihood: "Trung bình",
    severity: "Trung bình",
    control: "Xác nhận capacity/staging Nam trước khi tăng y_t",
  },
  {
    risk: "Saving giả",
    impact: "Thuê Bắc ↓ nhưng tổng network cost ↑",
    likelihood: "Cao",
    severity: "Cao",
    control: "Chỉ quyết định theo break-even + total landed cost",
  },
  {
    risk: "Hỏng hóc / handling",
    impact: "Repack & multi-touch tăng damage rate",
    likelihood: "Trung bình",
    severity: "Trung bình",
    control: "KPI damage theo route & phương án packing",
  },
];

export default function RiskPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Phân tích rủi ro</h1>
        <p className="mt-1 text-sm text-slate-600">
          Từ Word Bảng 7 — control bắt buộc trước khi phê duyệt playbook stacking / transfer.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {RISKS.map((r) => (
          <Card key={r.risk} hover>
            <CardHeader>
              <CardTitle>{r.risk}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-500">Tác động: </span>
                {r.impact}
              </p>
              <div className="flex gap-2">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  Khả năng: {r.likelihood}
                </span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                  Mức độ: {r.severity}
                </span>
              </div>
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-500">
                <span className="font-semibold text-sky-700">Kiểm soát: </span>
                {r.control}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
