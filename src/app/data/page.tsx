import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ASSUMPTIONS,
  IMPORT_VOLUME,
  MONTHS,
  OVER_FACT_CAP,
  OVER_TTL_CAP,
  SOURCES,
} from "@/lib/data/projectData";
import { fmt } from "@/lib/utils";

export default function DataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dữ liệu & nguồn</h1>
        <p className="mt-1 text-sm text-slate-400">
          Bảng validation — mọi số headline trích dẫn file / sheet / logic ô.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Đăng ký tài liệu</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <p><strong className="text-sky-300">Word:</strong> {SOURCES.word}</p>
          <p><strong className="text-sky-300">Excel:</strong> {SOURCES.excel} (25 sheet, 2.766 named range)</p>
          <p><strong className="text-sky-300">PPT:</strong> {SOURCES.ppt}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mâu thuẫn đã nhận diện</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="table-dark w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-2">Chủ đề</th>
                <th>Word</th>
                <th>Excel</th>
                <th>Ưu tiên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr><td className="py-2">m² unpack</td><td>1,7</td><td>1,6 (S110)</td><td>Excel cho cost; Word cho đề bài</td></tr>
              <tr><td className="py-2">Cơ sở over</td><td>Fact Cap 17.680</td><td>TTL Cap 28.495</td><td>Ghi nhãn cả hai; toggle Twin</td></tr>
              <tr><td className="py-2">Import năm</td><td>~106.407</td><td>106.460 (R11)</td><td>Excel</td></tr>
              <tr><td className="py-2">Import Aug</td><td>13.922</td><td>13.891</td><td>Excel</td></tr>
              <tr><td className="py-2">Xe/container</td><td>40–48 / plan 42</td><td>46,6</td><td>Hai kịch bản</td></tr>
              <tr><td className="py-2">Tiết kiệm stacking tỷ</td><td>mô hình capacity</td><td>−2,62</td><td>Cùng ~3 PPT</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Master data theo tháng</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="table-dark w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-2">Tháng</th>
                <th>Import</th>
                <th>Vượt Fact</th>
                <th>Vượt TTL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MONTHS.map((m) => (
                <tr key={m}>
                  <td className="py-1.5 font-medium text-slate-100">{m}</td>
                  <td className="tabular-nums">{fmt(IMPORT_VOLUME[m])}</td>
                  <td className="tabular-nums">{fmt(OVER_FACT_CAP[m])}</td>
                  <td className="tabular-nums">{fmt(OVER_TTL_CAP[m])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hằng số lõi</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
          {Object.entries(ASSUMPTIONS).map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
              <span className="text-slate-500">{k}</span>
              <span className="font-mono tabular-nums text-slate-200">{String(v)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
