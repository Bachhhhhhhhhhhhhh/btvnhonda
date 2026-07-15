/** Browser export helpers for LOG Twin web */

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(filename: string, data: unknown) {
  downloadText(
    filename,
    JSON.stringify(data, null, 2),
    "application/json;charset=utf-8"
  );
}

export function toCsv(
  rows: Record<string, string | number | boolean | null | undefined>[]
): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => esc(r[k])).join(",")),
  ];
  return "\uFEFF" + lines.join("\n"); // BOM for Excel VN
}

export function downloadCsv(
  filename: string,
  rows: Record<string, string | number | boolean | null | undefined>[]
) {
  downloadText(filename, toCsv(rows), "text/csv;charset=utf-8");
}

export function exportTwinPack(params: unknown, result: {
  months: Array<Record<string, unknown>>;
  annual: Record<string, number>;
}) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadJson(`log-twin-params-${stamp}.json`, { exportedAt: new Date().toISOString(), params });
  downloadCsv(
    `log-twin-monthly-${stamp}.csv`,
    result.months.map((m) => ({
      month: String(m.month),
      importVol: Number(m.importVol),
      baseOver: Number(m.baseOver),
      importRelief: Number(m.importRelief),
      residualAfterImport: Number(m.residualAfterImport),
      transferVol: Number(m.transferVol),
      outsourceVol: Number(m.outsourceVol),
      nsContainersBase: Number(m.nsContainersBase),
      casePool: Number(m.casePool),
      totalCost: Number(m.totalCost),
      classification: String(m.classification),
    }))
  );
  downloadCsv(`log-twin-annual-${stamp}.csv`, [
    Object.fromEntries(
      Object.entries(result.annual).map(([k, v]) => [k, v])
    ) as Record<string, number>,
  ]);
}
