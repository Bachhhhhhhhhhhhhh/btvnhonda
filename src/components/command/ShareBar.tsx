"use client";

import { useTwinStore } from "@/lib/store";
import {
  encodeParamsToQuery,
  decodeParamsFromQuery,
  copyText,
  useWorkspaceStore,
} from "@/lib/workspace";
import { downloadJson } from "@/lib/export";
import { useToast } from "@/components/wow/ToastHost";
import { Link2, Upload, Download, FileJson } from "lucide-react";
import { useEffect } from "react";

export function ShareBar() {
  const { params, setParams, result, snapshots } = useTwinStore();
  const { goals, checklist, notes, importWorkspace } = useWorkspaceStore();
  const pushToast = useToast((s) => s.push);

  // Apply ?s=&t= from URL once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const decoded = decodeParamsFromQuery(window.location.search, params);
    if (decoded) {
      setParams(decoded);
      pushToast({
        title: "Đã load policy từ URL",
        detail: "Share link applied",
        tone: "info",
      });
      // clean query without reload
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareLink = async () => {
    const q = encodeParamsToQuery(params);
    const finalUrl = `${window.location.origin}${window.location.pathname}?${q}`;
    await copyText(finalUrl);
    pushToast({
      title: "Đã copy share link",
      detail: "Mở link sẽ apply stack/TF/rate vào Twin",
      tone: "good",
    });
  };

  const exportWorkspace = () => {
    downloadJson(`log-twin-workspace-${new Date().toISOString().slice(0, 10)}.json`, {
      exportedAt: new Date().toISOString(),
      params,
      annual: result.annual,
      goals,
      checklist,
      notes,
      snapshots: snapshots.map((s) => ({
        id: s.id,
        name: s.name,
        savedAt: s.savedAt,
        params: s.params,
      })),
    });
    pushToast({ title: "Workspace JSON exported", tone: "good" });
  };

  const importFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.params) setParams(data.params);
        importWorkspace({
          goals: data.goals,
          checklist: data.checklist,
          notes: data.notes,
        });
        pushToast({
          title: "Import workspace OK",
          detail: file.name,
          tone: "good",
        });
      } catch {
        pushToast({ title: "Import thất bại", detail: "JSON không hợp lệ", tone: "warn" });
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 shadow-[var(--shadow-sm)]">
      <span className="px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        Workspace
      </span>
      <button
        type="button"
        onClick={shareLink}
        className="icon-btn gap-1.5 px-2.5 text-[11px] font-semibold text-[var(--ink)]"
      >
        <Link2 className="h-3.5 w-3.5 text-[var(--gold)]" />
        Copy share link
      </button>
      <button
        type="button"
        onClick={exportWorkspace}
        className="icon-btn gap-1.5 px-2.5 text-[11px] font-semibold text-[var(--ink)]"
      >
        <FileJson className="h-3.5 w-3.5 text-[var(--gold)]" />
        Export workspace
      </button>
      <button
        type="button"
        onClick={importFile}
        className="icon-btn gap-1.5 px-2.5 text-[11px] font-semibold text-[var(--ink)]"
      >
        <Upload className="h-3.5 w-3.5 text-[var(--gold)]" />
        Import JSON
      </button>
    </div>
  );
}
