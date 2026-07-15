"use client";

import { useTwinStore } from "@/lib/store";
import { ASSUMPTIONS, SOURCES } from "@/lib/data/projectData";
import { fmt, fmtPct } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const peak = result.months.reduce((b, m) => (m.baseOver > b.baseOver ? m : b));

  const paragraphs = [
    `Báo cáo hỗ trợ quyết định này tổng hợp chương trình tối ưu năng lực kho xe máy miền Bắc trong mùa cao điểm của Honda Việt Nam, kết nối đồng thời nghiên cứu stacking chuyên sâu (${SOURCES.word}), workbook ngân sách logistics 103Ki 2QFC (${SOURCES.excel}) và slide điều hành LOG Unit Yamagomori (${SOURCES.ppt}). Câu hỏi quản trị trung tâm không phải stacking có hấp dẫn về khái niệm hay không, mà là trong điều kiện định lượng nào thì stacking, thuê ngoài Bắc hoặc chuyển Bắc–Nam tối thiểu hóa tổng chi phí mạng lưới mà vẫn bảo vệ service level và tính toàn vẹn claim chất lượng.`,

    `Với cài đặt Digital Twin hiện tại, Fact Cap được mô hình hóa ở mức ${fmt(params.factCap)} xe, footprint unpack ${params.unpackM2} m²/xe và footprint chồng kiện ${params.stackM2} m²/xe. Tỷ lệ relief capacity tương đương do đó đạt ${fmtPct((params.unpackM2 - params.stackM2) / params.unpackM2)}; áp dụng lên volume nhập khẩu năm ${fmt(a.importVol)} xe với tỷ lệ tham gia stacking ${fmtPct(params.importStackRatio, 0)} tạo ra khoảng ${fmt(a.importRelief)} đơn vị capacity tương đương và tiết kiệm xấp xỉ ${fmt(a.m2Saved)} m² sàn. Các con số này tái khẳng định phương pháp Word “Import relief = Import × (unpack − stack) / unpack” và cùng hướng với tuyên bố PowerPoint rằng stacking quy mô CBU có thể giải phóng khoảng mười nghìn m² và khoảng ba tỷ VND mỗi năm.`,

    `Tuy nhiên, chỉ stacking nhập khẩu không khép được khoảng trống peak. Dưới định nghĩa vượt capacity ${params.useTtlCapacity ? "TTL Cap Excel" : "Fact Cap Word"}, tháng residual cao nhất là ${peak.month}, với over gốc ${fmt(peak.baseOver)} xe được giảm bởi import stacking xuống residual ${fmt(peak.residualAfterImport)} trước khi chính sách nội địa can thiệp. Sau khi áp dụng tỷ lệ transfer ${fmtPct(params.transferRatio, 0)}, thuê ngoài Bắc residual còn ${fmt(peak.outsourceVol)} xe trong tháng đó, trong khi volume thuê ngoài năm giảm từ ${fmt(a.baseOutsourceVol)} xuống ${fmt(a.outsourceVol)} xe-tương đương — tuyệt đối ${fmt(a.outsourceReduction)} đơn vị.`,

    `Hệ quả vận tải mạng lưới là đáng kể. Nhu cầu container Bắc–Nam theo quy ước ${params.casesPerContainerNS} kiện/container và ${params.mcPerCase} xe/kiện đạt ${fmt(a.nsContainersBase)} container/năm, so với ${fmt(a.nsContainersExcel)} container nếu đạt năng suất workbook ${params.mcPerContainerExcel} xe/container. Hoàn kiện rỗng ở mức ${params.casesPerContainerReturn} kiện/container tương ứng ${fmt(a.returnContainers)} container return; chu kỳ reverse logistics ${params.leadTimeDays} ngày lead cộng ${params.freeTimeDays} ngày free sizing case pool đỉnh khoảng ${fmt(a.peakCasePool)} kiện. Mọi kế hoạch bỏ qua coverage case pool sẽ thất bại vận hành ngay cả khi container chiều đi dường như đủ.`,

    `Về tài chính, baseline trong đó mọi đơn vị over được hấp thụ bằng thuê ngoài Bắc và bonus peak tạo chi phí năm ${fmt(a.baselineCost / 1e9, 2)} tỷ VND. Chính sách tối ưu — stacking NK kết hợp transfer chọn lọc — phát sinh ${fmt(a.totalCost / 1e9, 2)} tỷ VND, tiết kiệm mô hình ${fmt(a.totalSavings / 1e9, 2)} tỷ VND. So với vốn stacking ${fmt(params.cost.stackCapex / 1e9, 2)} tỷ VND, ROI đạt ${fmtPct(a.roi)} với hoàn vốn đơn giản ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "không đạt dưới rate card hiện tại"} và NPV ba năm ${fmt(a.npv / 1e9, 2)} tỷ VND ở suất chiết khấu ${fmtPct(params.cost.discountRate)}. Cường độ chi phí đứng ở ${fmt(a.costPerVehicle)} VND/xe được xử lý và ${fmt(a.costPerM2)} VND/m² tiết kiệm.`,

    `Hai định nghĩa capacity không được trộn trong tranh luận điều hành. Báo cáo Word sizing over theo Fact Cap ${fmt(ASSUMPTIONS.factCapNorth)}, tạo gap peak gần năm mươi nghìn xe tháng Tám. Engine Excel Rental WH sizing over theo TTL capacity ${fmt(ASSUMPTIONS.ttlCapNorth)} — đã gồm open area và HNM — nên residual nhỏ hơn và tập trung tháng Mười Hai đến Tháng Ba. Cả hai đều nhất quán nội bộ; chọn sai baseline sẽ hoặc đánh giá thấp “nỗi đau” peak, hoặc thổi phồng mức khẩn cấp thuê ngoài.`,

    `Tương tự, driver footprint khác nhau: đề bài và Word dùng 1,7 m² unpack so 1,0 m² stack, trong khi driver ngân sách dài hạn Bắc ở Rental WH là 1,6 m²/xe. Phân tích độ nhạy trong ứng dụng cho thấy mật độ stack, đơn giá thuê ngoài Bắc và cước N–S chi phối phương sai savings, xác nhận việc khóa rate card Finance là cổng chặn trước cam kết ngân sách đa năm.`,

    `Tư thế vận hành khuyến nghị do đó mang tính phân tầng. Thứ nhất, thể chế hóa stacking nhập khẩu kèm kiểm soát chất lượng bảo vệ cửa sổ claim NSX. Thứ hai, phân loại tháng xanh–vàng–đỏ theo residual sau stack NK, và pre-book container cùng case pool bốn tuần trước cụm đỏ. Thứ ba, mở rộng transfer nội địa chỉ khi chi phí tránh được ở Bắc còn lớn hơn chi phí transfer all-in; nếu không, giữ thuê ngoài Bắc có kiểm soát. Thứ tư, duy trì nhịp Digital Twin — hàng tuần mùa cao điểm — để shock volume, rate và lead time được định giá lại trước khi cam kết tiền mặt.`,

    `Kết luận, stacking là điều kiện cần nhưng chưa đủ cho capacity peak miền Bắc. Khi kết hợp transfer chọn lọc, reverse logistics được sizing đúng và quản trị theo tổng chi phí mạng lưới, stacking biến phụ thuộc thuê kho mãn tính thành chương trình S&OP có kiểm soát. Bằng chứng số trong báo cáo — capacity, container, case pool, ROI và phong bì kịch bản — phải được chạy lại mỗi khi niguri, tender cước hoặc hợp đồng kho thay đổi, bảo đảm tổ chức tối ưu kinh tế thay vì chỉ dời chi phí trên bản đồ Việt Nam.`,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo tư vấn chuyên sâu</h1>
          <p className="mt-1 text-sm text-slate-600">
            Văn bản tư vấn sống — tái sinh từ output Digital Twin · phong cách McKinsey, bám số Excel/Word/PPT.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-800"
        >
          In / Xuất PDF
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Tối ưu kho miền Bắc mùa cao điểm — Tường thuật điều hành
          </CardTitle>
        </CardHeader>
        <CardContent className="prose-report max-w-none">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="mt-6 text-xs text-slate-500">
            Số từ ≈ {paragraphs.join(" ").split(/\s+/).length}. Nguồn: {SOURCES.word};{" "}
            {SOURCES.excel}; {SOURCES.ppt}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
