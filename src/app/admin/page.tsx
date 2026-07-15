"use client";

import { useTwinStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AUDIT = [
  { t: "2026-07-15 13:30", actor: "hệ thống", action: "Nạp knowledge base từ Word/Excel/PPT" },
  { t: "2026-07-15 13:48", actor: "hệ thống", action: "Khởi tạo Digital Twin engine (defaultParams)" },
  { t: "2026-07-15 13:55", actor: "người dùng", action: "Scaffold DSS web (Next.js)" },
  { t: "2026-07-15 14:30", actor: "hệ thống", action: "Nâng cấp giao diện VN + dark premium" },
];

export default function AdminPage() {
  const { params, reset } = useTwinStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Quản trị / Audit</h1>
        <p className="mt-1 text-sm text-slate-400">
          Snapshot tham số và nhật ký thay đổi phục vụ quản trị.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>JSON tham số sống</CardTitle>
          <button
            onClick={reset}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
          >
            Đặt lại mặc định
          </button>
        </CardHeader>
        <CardContent>
          <pre className="max-h-96 overflow-auto rounded-xl border border-emerald-500/20 bg-slate-950 p-4 text-xs text-emerald-300">
            {JSON.stringify(params, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nhật ký audit</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {AUDIT.map((a, i) => (
              <li
                key={i}
                className="flex flex-wrap gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <span className="font-mono text-xs text-slate-500">{a.t}</span>
                <span className="font-semibold text-sky-300">{a.actor}</span>
                <span className="text-slate-300">{a.action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
