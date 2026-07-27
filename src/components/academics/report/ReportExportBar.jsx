import { useState } from "react";
import { Printer, FileDown, Share2 } from "lucide-react";
import { printReport, exportReportPdf, shareReport } from "@/lib/academics/reportExport";
import { useToast } from "@/components/ui/use-toast";

export default function ReportExportBar({ reportRef }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);

  const run = async (key, fn) => {
    setBusy(key);
    try {
      await fn();
    } catch {
      toast({ title: `Couldn't ${key} the report`, variant: "destructive" });
    }
    setBusy(null);
  };

  const btn = "w-9 h-9 rounded-full glass-card flex items-center justify-center spring-tap";

  return (
    <div className="flex gap-2">
      <button
        aria-label="Print report"
        onClick={() => run("print", () => printReport(reportRef.current))}
        className={btn}
        disabled={busy !== null}
      >
        <Printer className="w-4 h-4 text-foreground" />
      </button>
      <button
        aria-label="Export PDF"
        onClick={() => run("pdf", () => exportReportPdf(reportRef.current))}
        className={btn}
        disabled={busy !== null}
      >
        <FileDown className="w-4 h-4 text-foreground" />
      </button>
      <button
        aria-label="Share report"
        onClick={() => {
          const s = shareReport();
          toast({ title: "Sharing coming soon", description: s.message });
        }}
        className={btn}
      >
        <Share2 className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
}