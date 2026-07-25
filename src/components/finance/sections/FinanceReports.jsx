import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, Btn } from "@/components/management/management-ui";
import { FileBarChart, Wallet, ArrowLeftRight, RotateCcw, Award, Receipt, Download, FileSpreadsheet, Printer } from "lucide-react";

const REPORTS = [
  { id: "revenue", label: "Revenue Report", entity: "FinancialTransaction", icon: FileBarChart },
  { id: "payments", label: "Payment Report", entity: "PaymentAttempt", icon: ArrowLeftRight },
  { id: "wallets", label: "Wallet Report", entity: "Wallet", icon: Wallet },
  { id: "refunds", label: "Refund Report", entity: "RefundRequest", icon: RotateCcw },
  { id: "scholarships", label: "Scholarship Report", entity: "ScholarshipAward", icon: Award },
  { id: "fees", label: "Outstanding Fees", entity: "FeeStructure", icon: Receipt },
];

const fetchRows = async (entity, instId) => { try { return (await base44.entities[entity].filter({ institution_id: instId }, "-created_date", 1000)) || []; } catch { try { return (await base44.entities[entity].list("-created_date", 1000)) || []; } catch { return []; } } };
const toCSV = (rows) => { if (!rows.length) return ""; const keys = Object.keys(rows[0]).filter((k) => k !== "id"); const head = keys.join(","); const body = rows.map((r) => keys.map((k) => { const v = r[k]; if (v === null || v === undefined) return ""; if (typeof v === "object") return `"${JSON.stringify(v).replace(/"/g, '""')}"`; return `"${String(v).replace(/"/g, '""')}"`; }).join(",")).join("\n"); return head + "\n" + body; };
const download = (name, csv, type) => { const blob = new Blob([csv], { type }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); };

export default function FinanceReports({ institutionId }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);

  const exp = async (r, kind) => {
    setBusy(r.id + kind);
    const rows = await fetchRows(r.entity, institutionId);
    const csv = toCSV(rows);
    if (kind === "pdf") {
      const w = window.open("", "_blank"); if (!w) { toast({ title: "Allow popups to print PDF", variant: "destructive" }); setBusy(null); return; }
      const keys = rows.length ? Object.keys(rows[0]).filter((k) => k !== "id") : [];
      w.document.write(`<html><head><title>${r.label}</title><style>body{font-family:system-ui;padding:24px}h2{margin:0 0 12px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f3f4f6}</style></head><body><h2>${r.label}</h2><p>Generated ${new Date().toLocaleString()} · ${rows.length} records</p><table><tr>${keys.map((k) => `<th>${k}</th>`).join("")}</tr>${rows.map((x) => `<tr>${keys.map((k) => `<td>${x[k] ?? ""}</td>`).join("")}</tr>`).join("")}</table></body></html>`);
      w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
    } else { download(`${r.label}.${kind === "excel" ? "xls" : "csv"}`, csv, kind === "excel" ? "application/vnd.ms-excel" : "text/csv"); }
    toast({ title: `${kind.toUpperCase()} exported` }); setBusy(null);
  };

  return (
    <div>
      <SectionHeader title="Financial Reporting" desc="Revenue, payment, wallet, refund, outstanding fees and scholarship reports — export to PDF, Excel or CSV." />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Panel key={r.id}>
              <div className="flex items-start gap-3 mb-3"><div className="w-9 h-9 rounded-xl bg-primary/15 grid place-items-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div><h3 className="font-heading font-semibold text-[14px] mt-1">{r.label}</h3></div>
              <div className="flex gap-2">
                <Btn variant="soft" size="sm" className="flex-1" disabled={busy === r.id + "pdf"} onClick={() => exp(r, "pdf")}><Printer className="w-3.5 h-3.5" />PDF</Btn>
                <Btn variant="soft" size="sm" className="flex-1" disabled={busy === r.id + "excel"} onClick={() => exp(r, "excel")}><FileSpreadsheet className="w-3.5 h-3.5" />Excel</Btn>
                <Btn variant="soft" size="sm" className="flex-1" disabled={busy === r.id + "csv"} onClick={() => exp(r, "csv")}><Download className="w-3.5 h-3.5" />CSV</Btn>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}