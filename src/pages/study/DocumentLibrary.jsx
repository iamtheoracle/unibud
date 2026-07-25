import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import BudThinking from "@/components/study/BudThinking";
import { toast } from "@/components/ui/use-toast";

export default function DocumentLibrary() {
  const qc = useQueryClient();
  const { data: docs } = useQuery({ queryKey: ["studyDocs"], queryFn: () => base44.entities.StudentDocument.list("-created_date", 100) });
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", category: "pdf", file_url: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [compare, setCompare] = useState([]);

  const create = useMutation({ mutationFn: (v) => base44.entities.StudentDocument.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["studyDocs"] }); toast({ title: "Document added" }); setAdding(false); } });
  const del = useMutation({ mutationFn: (id) => base44.entities.StudentDocument.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["studyDocs"] }); toast({ title: "Document removed" }); } });

  const upload = async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploading(true); try { const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); setForm((s) => ({ ...s, file_url, title: s.title || f.name.replace(/\.[^.]+$/, "") })); } catch { toast({ title: "Upload failed" }); } finally { setUploading(false); e.target.value = ""; } };

  const analyze = async (doc, action) => {
    setLoading(true); setResult("");
    const map = { summary: "Summarize this document and highlight key concepts", keypoints: "Extract the key points as a concise bulleted list", ocr: "Perform OCR / text extraction and return the readable text" };
    try { const res = await base44.integrations.Core.InvokeLLM({ prompt: `${map[action] || "Analyze this document"}.`, file_urls: [doc.file_url] }); setResult(typeof res === "string" ? res : res?.response || "Done."); }
    catch { setResult("I'm here — try again."); } finally { setLoading(false); }
  };

  const compareDocs = async () => {
    if (compare.length < 2) { toast({ title: "Select two documents" }); return; }
    setLoading(true); setResult("");
    try { const res = await base44.integrations.Core.InvokeLLM({ prompt: "Compare these two documents: highlight similarities, differences, and key insights.", file_urls: compare.map((id) => docs.find((d) => d.id === id)?.file_url).filter(Boolean) }); setResult(typeof res === "string" ? res : res?.response || "Done."); }
    catch { setResult("I'm here — try again."); } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Document Library" action={<button onClick={() => setAdding(true)} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>} />
      {!docs?.length ? <EmptyState message="No documents yet. Upload one to unlock AI understanding." /> : (
        <div className="space-y-3">
          {docs.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-foreground truncate">{d.title}</p><p className="text-[10px] text-muted-foreground uppercase">{d.category}</p></div>
                <input type="checkbox" checked={compare.includes(d.id)} onChange={(e) => { if (e.target.checked) setCompare((c) => c.length < 2 ? [...c, d.id] : c); else setCompare((c) => c.filter((x) => x !== d.id)); }} className="w-4 h-4 accent-[#7FD8FF]" />
              </div>
              <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-primary inline-block mt-1">Open file</a>
              <div className="flex flex-wrap gap-2 mt-2">{[["summary", "Summarize"], ["keypoints", "Key points"], ["ocr", "OCR text"]].map(([k, l]) => <button key={k} onClick={() => analyze(d, k)} className="px-3 py-1.5 rounded-full glass text-[11px] font-semibold text-foreground spring-tap">{l}</button>)}</div>
              <button onClick={() => del.mutate(d.id)} className="text-[11px] font-semibold text-destructive spring-tap mt-2">Delete</button>
            </motion.div>
          ))}
        </div>
      )}
      {compare.length === 2 && <button onClick={compareDocs} className="w-full h-[48px] mt-4 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[14px] spring-tap ice-glow">Compare selected documents</button>}
      {(loading || result) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4">
          {loading ? <BudThinking label="Bud is reading your document…" /> : <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{result}</p>}
        </motion.div>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="Add Document">
        <div className="space-y-3.5">
          <GlassInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60 capitalize">{["pdf", "word", "powerpoint", "excel", "images", "voice_notes", "scanned_notes", "other"].map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}</select></div>
          <label className="flex items-center gap-3 h-[48px] px-4 rounded-2xl glass cursor-pointer"><input type="file" onChange={upload} className="hidden" /><span className="text-[13px] text-muted-foreground flex-1">{uploading ? "Uploading…" : form.file_url ? "File attached — tap to change" : "Tap to upload file"}</span></label>
        </div>
        <button onClick={() => { if (!form.title || !form.file_url) { toast({ title: "Title and file required" }); return; } create.mutate(form); setForm({ title: "", category: "pdf", file_url: "" }); }} disabled={create.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{create.isPending ? "Saving…" : "Save Document"}</button>
      </Sheet>
    </div>
  );
}