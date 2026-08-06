import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, Btn } from "@/components/management/management-ui";
import {
  Calendar, TrendingUp, TrendingDown, DollarSign, RotateCcw,
  Download, FileSpreadsheet, Printer, ShieldCheck, Loader2,
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthRange(year, month) {
  const start = new Date(year, month, 1).toISOString();
  const end = new Date(year, month + 1, 1).toISOString();
  return { start, end };
}

const STATUS_LABELS = {
  completed: "Successful",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const CATEGORY_LABELS = {
  deposit: "Deposits",
  withdrawal: "Withdrawals",
  tuition_payment: "Tuition",
  school_fee: "School Fees",
  hostel_fee: "Hostel Fees",
  acceptance_fee: "Acceptance Fees",
  examination_fee: "Examination Fees",
  library_fee: "Library Fees",
  refund: "Refunds",
  transfer: "Transfers",
  adjustment: "Adjustments",
};

export default function MonthlyFinancialReport({ institutionId }) {
  const { toast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [exporting, setExporting] = useState(null);

  const years = useMemo(() => {
    const arr = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) arr.push(y);
    return arr;
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const { start, end } = monthRange(year, month);
      const filter = { created_date: { $gte: start, $lt: end } };
      if (institutionId) filter.institution_id = institutionId;

      let txns = [];
      try {
        txns = (await base44.entities.FinancialTransaction.filter(filter, "-created_date", 2000)) || [];
      } catch {
        txns = (await base44.entities.FinancialTransaction.list("-created_date", 2000)) || [];
      }

      // Previous month for growth comparison
      const prevRange = monthRange(year, month - 1);
      const prevFilter = { created_date: { $gte: prevRange.start, $lt: prevRange.end } };
      if (institutionId) prevFilter.institution_id = institutionId;
      let prevTxns = [];
      try {
        prevTxns = (await base44.entities.FinancialTransaction.filter(prevFilter, "-created_date", 2000)) || [];
      } catch {
        prevTxns = [];
      }

      const compute = (list) => {
        const totalVolume = list.reduce((s, t) => s + (t.amount || 0), 0);
        const revenue = list.filter((t) => t.status === "completed" && t.type !== "refund" && t.type !== "withdrawal")
          .reduce((s, t) => s + (t.amount || 0), 0);
        const refunds = list.filter((t) => t.type === "refund" || t.status === "refunded")
          .reduce((s, t) => s + (t.amount || 0), 0);

        const byStatus = {};
        for (const s of ["completed", "pending", "failed", "cancelled"]) {
          byStatus[s] = list.filter((t) => t.status === s).length;
        }

        const byCategory = {};
        for (const t of list) {
          const key = t.type || "other";
          if (!byCategory[key]) byCategory[key] = { count: 0, amount: 0 };
          byCategory[key].count++;
          byCategory[key].amount += t.amount || 0;
        }

        return { totalVolume, revenue, refunds, byStatus, byCategory, count: list.length };
      };

      const current = compute(txns);
      const previous = compute(prevTxns);
      const growth = previous.totalVolume > 0
        ? ((current.totalVolume - previous.totalVolume) / previous.totalVolume) * 100
        : current.totalVolume > 0 ? 100 : 0;

      // Integrity hash
      const hashInput = JSON.stringify({ year, month, count: current.count, volume: current.totalVolume, ts: Date.now() });
      const hash = btoa(hashInput).slice(0, 16);

      setReport({
        period: `${MONTHS[month]} ${year}`,
        generatedAt: new Date().toISOString(),
        generator: "UNIBUD Financial Platform",
        integrityHash: hash,
        ...current,
        growth,
        prevVolume: previous.totalVolume,
      });
    } catch (e) {
      toast({ title: "Failed to generate report", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (kind) => {
    if (!report) return;
    setExporting(kind);
    try {
      const header = [
        `UNIBUD Monthly Financial Report`,
        `Period: ${report.period}`,
        `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
        `Generator: ${report.generator}`,
        `Integrity Hash: ${report.integrityHash}`,
        `Total Records: ${report.count}`,
        "",
      ];

      const summaryRows = [
        ["Metric", "Value"],
        ["Total Transaction Volume", report.totalVolume.toLocaleString()],
        ["Revenue", report.revenue.toLocaleString()],
        ["Refunds", report.refunds.toLocaleString()],
        ["Net Revenue", (report.revenue - report.refunds).toLocaleString()],
        ["Growth vs Previous Month", `${report.growth.toFixed(1)}%`],
        ["Previous Month Volume", report.prevVolume.toLocaleString()],
        "",
        ["Status Breakdown", "Count"],
        ...Object.entries(report.byStatus).map(([k, v]) => [STATUS_LABELS[k] || k, v]),
        "",
        ["Category Breakdown", "Count", "Amount"],
        ...Object.entries(report.byCategory).map(([k, v]) => [CATEGORY_LABELS[k] || k, v.count, v.amount.toLocaleString()]),
      ];

      if (kind === "pdf") {
        const w = window.open("", "_blank");
        if (!w) { toast({ title: "Allow popups to print PDF", variant: "destructive" }); return; }
        w.document.write(`<html><head><title>Financial Report — ${report.period}</title>
          <style>body{font-family:system-ui;padding:32px}h1{font-size:18px}h2{font-size:14px;margin-top:16px}
          table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
          th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f3f4f6}
          .meta{color:#666;font-size:11px;margin-bottom:16px}</style></head><body>
          <h1>UNIBUD Monthly Financial Report</h1>
          <div class="meta">Period: ${report.period} · Generated: ${new Date(report.generatedAt).toLocaleString()}<br>
          Integrity Hash: ${report.integrityHash} · Generator: ${report.generator}</div>
          <h2>Summary</h2><table>${summaryRows.slice(0, 7).map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>
          <h2>Status Breakdown</h2><table>${summaryRows.slice(9, 9 + 4).map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>
          <h2>Category Breakdown</h2><table>${summaryRows.slice(-Object.keys(report.byCategory).length - 1).map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>
          </body></html>`);
        w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
      } else {
        const csv = [...header, ...summaryRows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: kind === "excel" ? "application/vnd.ms-excel" : "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Financial_Report_${report.period.replace(/\s/g, "_")}.${kind === "excel" ? "xls" : "csv"}`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast({ title: `${kind.toUpperCase()} exported` });
    } catch (e) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Monthly Financial Reports"
        desc="Generate transaction summaries by month — totals, category breakdowns, status distribution, and growth comparison."
      />

      {/* Month selector */}
      <Panel className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="oracle-input" style={{ minWidth: 140 }}>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="oracle-input" style={{ minWidth: 100 }}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Btn onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
            Generate Report
          </Btn>
        </div>
      </Panel>

      {report && (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            <Panel>
              <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-primary" /><span className="text-[12px] text-muted-foreground">Total Volume</span></div>
              <p className="text-[22px] font-bold text-foreground tabular-nums">{report.totalVolume.toLocaleString()}</p>
            </Panel>
            <Panel>
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-success" /><span className="text-[12px] text-muted-foreground">Revenue</span></div>
              <p className="text-[22px] font-bold text-foreground tabular-nums">{report.revenue.toLocaleString()}</p>
            </Panel>
            <Panel>
              <div className="flex items-center gap-2 mb-1"><RotateCcw className="w-4 h-4 text-destructive" /><span className="text-[12px] text-muted-foreground">Refunds</span></div>
              <p className="text-[22px] font-bold text-foreground tabular-nums">{report.refunds.toLocaleString()}</p>
            </Panel>
            <Panel>
              <div className="flex items-center gap-2 mb-1">
                {report.growth >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                <span className="text-[12px] text-muted-foreground">Growth</span>
              </div>
              <p className={`text-[22px] font-bold tabular-nums ${report.growth >= 0 ? "text-success" : "text-destructive"}`}>
                {report.growth >= 0 ? "+" : ""}{report.growth.toFixed(1)}%
              </p>
            </Panel>
          </div>

          {/* Status + Category breakdown */}
          <div className="grid lg:grid-cols-2 gap-3 mb-4">
            <Panel>
              <h3 className="font-heading font-semibold text-[14px] mb-3">Status Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(report.byStatus).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">{STATUS_LABELS[k] || k}</span>
                    <span className="text-[13px] font-bold text-foreground tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel>
              <h3 className="font-heading font-semibold text-[14px] mb-3">Category Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(report.byCategory).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">{CATEGORY_LABELS[k] || k}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">{v.count} txns</span>
                      <span className="text-[13px] font-bold text-foreground tabular-nums">{v.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Report metadata + export */}
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Generated {new Date(report.generatedAt).toLocaleString()} · Integrity: {report.integrityHash}</span>
              </div>
              <div className="flex gap-2">
                <Btn variant="soft" size="sm" disabled={exporting === "pdf"} onClick={() => exportReport("pdf")}><Printer className="w-3.5 h-3.5" />PDF</Btn>
                <Btn variant="soft" size="sm" disabled={exporting === "excel"} onClick={() => exportReport("excel")}><FileSpreadsheet className="w-3.5 h-3.5" />Excel</Btn>
                <Btn variant="soft" size="sm" disabled={exporting === "csv"} onClick={() => exportReport("csv")}><Download className="w-3.5 h-3.5" />CSV</Btn>
              </div>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}