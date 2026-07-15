import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOURCES, ASSUMPTIONS } from "@/lib/data/projectData";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan dự án</h1>
        <p className="mt-1 text-sm text-slate-600">
          Honda Việt Nam MC Logistics — tối ưu stacking & thuê ngoài kho miền Bắc
          (tác giả: Trương Thế Bách / OM029354).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" hover>
          <CardHeader>
            <CardTitle>Bài toán kinh doanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              Mùa cao điểm, kho xe máy miền Bắc vượt capacity hữu dụng, phát sinh
              thuê kho ngoài, bonus, tăng ca và nghẽn vận hành. Giải pháp đề xuất:
              lưu xe theo kiện chồng (stacking) thay vì unpack ngay khi nhập,
              giải phóng diện tích sàn mà chưa cần mở rộng kho sở hữu.
            </p>
            <p>
              <strong className="text-sky-700">Nhánh nhập khẩu:</strong> hàng NK
              đã ở dạng kiện, có thể chồng tối đa 3 tầng (2–4 xe/kiện). Footprint
              từ {ASSUMPTIONS.unpackM2} m²/xe xuống {ASSUMPTIONS.stackM2} m²/xe —
              tương đương relief ~41,2% capacity theo xe.
            </p>
            <p>
              <strong className="text-violet-300">Nhánh nội địa:</strong> stacking
              không miễn phí — đóng kiện, bốc xếp, rủi ro hỏng hóc và tùy chọn
              chuyển Nam phải so với thuê ngoài Bắc theo tổng chi phí mạng lưới.
              Biến quyết định: x_t (stack), y_t (transfer), z_t (outsource).
            </p>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle>Tài liệu nguồn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Word</div>
              <div className="mt-1 text-slate-700">{SOURCES.word}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Excel</div>
              <div className="mt-1 text-slate-700">{SOURCES.excel}</div>
              <div className="mt-1 text-xs text-slate-500">25 sheet · 103Ki 2QFC Jun</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PowerPoint</div>
              <div className="mt-1 text-slate-700">{SOURCES.ppt}</div>
              <div className="mt-1 text-xs text-slate-500">Slide 17/30 & 19/30</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card hover>
          <CardHeader>
            <CardTitle>Luồng ý tưởng stacking (PPT 19/30)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Import → Stock In</li>
              <li>Chụp ảnh VIN/ENG (còn trong kiện)</li>
              <li><strong className="text-emerald-700">Lưu kho chồng kiện</strong> (giảm diện tích thuê)</li>
              <li>Thông quan</li>
              <li>Unpack khi cần giao</li>
              <li>Giao đại lý</li>
            </ol>
            <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-900">
              Điểm lưu ý: unpack trễ có thể ảnh hưởng claim nhà sản xuất —
              cần RACI rõ với Genpo / QA.
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardHeader>
            <CardTitle>Bối cảnh mạng lưới (PPT 17/30)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            <ul className="space-y-2">
              <li>Toàn quốc 100%: {ASSUMPTIONS.nationwideCap100.toLocaleString("vi-VN")} xe</li>
              <li>Bắc 100%: {ASSUMPTIONS.northCap100.toLocaleString("vi-VN")} (38%)</li>
              <li>Trung 100%: {ASSUMPTIONS.centralCap100.toLocaleString("vi-VN")} (22%)</li>
              <li>Nam 100%: {ASSUMPTIONS.southCap100.toLocaleString("vi-VN")} (40%)</li>
              <li>HVN sở hữu: 33% · Thuê ngoài: 67%</li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Phụ thuộc cao vào kho thuê do năng lực nội bộ hạn chế — stacking
              tăng tự chủ trước khi thuê thêm.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
