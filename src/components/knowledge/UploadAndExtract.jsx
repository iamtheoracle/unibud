import React, { useState } from "react";
import { Upload, Loader2, Sparkles, FileCheck2 } from "lucide-react";

/**
 * UploadAndExtract — drop a file (PDF/DOCX/PPTX/XLSX/TXT/image/audio/video),
 * upload it to the unified library, then run Spark AI extraction in one flow.
 */
export default function UploadAndExtract({ kb }) {
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [lastDoc, setLastDoc] = useState(null);

  const handleFiles = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      setStage("Uploading…");
      const doc = await kb.upload(file, "knowledge");
      setLastDoc(doc);
      setStage("Spark is reading your file…");
      await kb.extract({ id: doc.id, kind: "file", title: doc.title, file_url: doc.file_url });
      setStage("");
    } catch {
      setStage("");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <label className="glass-card p-4 flex items-center gap-3 cursor-pointer spring-tap">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">
          {busy ? stage : "Add a file to your knowledge"}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {lastDoc ? <span className="flex items-center gap-1"><FileCheck2 className="w-3 h-3" /> {lastDoc.title}</span> : "PDF · DOCX · PPTX · XLSX · TXT · images · audio · video — auto-indexed by Spark"}
        </p>
      </div>
      <Sparkles className={`w-4 h-4 ${busy ? "text-accent animate-pulse" : "text-muted-foreground"}`} />
      <input type="file" className="hidden" onChange={handleFiles} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*,audio/*,video/*" />
    </label>
  );
}