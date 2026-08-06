import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/me/SectionHeader";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];
const CATEGORIES = ["all", "pdf", "word", "powerpoint", "excel", "images", "voice_notes", "scanned_notes"];

function extCategory(name) {
  const e = (name.split(".").pop() || "").toLowerCase();
  if (e === "pdf") return "pdf";
  if (["doc", "docx"].includes(e)) return "word";
  if (["ppt", "pptx"].includes(e)) return "powerpoint";
  if (["xls", "xlsx", "csv"].includes(e)) return "excel";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(e)) return "images";
  if (["mp3", "m4a", "wav", "ogg"].includes(e)) return "voice_notes";
  return "other";
}

/**
 * DocumentLibrary — upload, categorize, search, sort, and delete files.
 */
export default function DocumentLibrary() {
  const qc = useQueryClient();
  const { data: docs } = useQuery({ queryKey: ["meDocs"], queryFn: () => base44.entities.StudentDocument.list("-created_date", 100) });
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const del = useMutation({
    mutationFn: (id) => base44.entities.StudentDocument.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meDocs"] }),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.StudentDocument.create({
        title: file.name,
        category: extCategory(file.name),
        file_url,
        file_type: file.type,
        file_size: file.size,
      });
      qc.invalidateQueries({ queryKey: ["meDocs"] });
      toast({ title: "Document uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  let list = (docs || []).filter((d) => cat === "all" || d.category === cat);
  if (q) list = list.filter((d) => (d.title || "").toLowerCase().includes(q.toLowerCase()));
  list = [...list].sort((a, b) =>
    sort === "newest" ? (b.created_date || "").localeCompare(a.created_date || "") : (a.title || "").localeCompare(b.title || "")
  );

  return (
    <div>
      <SectionHeader
        title="Document Library"
        action={
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="text-[12px] font-semibold text-primary spring-tap disabled:opacity-50">
            {uploading ? "Uploading…" : "+ Upload"}
          </button>
        }
      />
      <input ref={fileRef} type="file" onChange={handleUpload} className="hidden" />
      <div className="glass-card p-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search documents…"
          className="w-full h-[44px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 mb-3"
        />
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap capitalize ${cat === c ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}
            >
              {c.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-muted-foreground">{list.length} file{list.length !== 1 ? "s" : ""}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-8 px-2 rounded-lg bg-muted/50 border border-border text-[11px] text-foreground focus:outline-none">
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
        {list.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-6">No documents yet. Upload notes, slides, or scanned materials.</p>
        ) : (
          <div className="space-y-2">
            {list.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary uppercase">{(d.category || "file").slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{d.title}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{(d.category || "").replace("_", " ")}</p>
                </div>
                <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-primary spring-tap">Open</a>
                <button onClick={() => del.mutate(d.id)} className="text-[11px] font-semibold text-muted-foreground spring-tap">Delete</button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}