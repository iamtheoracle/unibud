import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import BudThinking from "@/components/study/BudThinking";
import { toast } from "@/components/ui/use-toast";

const STYLES = ["APA 7", "MLA", "Chicago", "Harvard", "IEEE"];
const TYPES = ["book", "journal", "website", "conference", "thesis", "report", "other"];

export default function CitationManager() {
  const qc = useQueryClient();
  const { data: citations } = useQuery({ queryKey: ["citations"], queryFn: () => base44.entities.Citation.list("-created_date", 200) });
  const [form, setForm] = useState({ title: "", authors: "", year: "", source_type: "journal", publisher: "", url: "" });
  const [style, setStyle] = useState("APA 7");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [filter, setFilter] = useState("all");

  const save = useMutation({ mutationFn: (v) => base44.entities.Citation.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["citations"] }); toast({ title: "Citation saved" }); } });
  const del = useMutation({ mutationFn: (id) => base44.entities.Citation.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["citations"] }); toast({ title: "Citation deleted" }); } });

  const format = async () => {
    if (!form.title && !form.url) { toast({ title: "Enter a title or URL" }); return; }
    setLoading(true); setResult("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Format this source in ${style} citation style. Source: title="${form.title}", authors="${form.authors}", year="${form.year}", type="${form.source_type}", publisher="${form.publisher}", url="${form.url}". Return ONLY the formatted citation string, ready to paste into a bibliography.`,
        ...(form.url ? { add_context_from_internet: true, model: "gemini_3_flash" } : {}),
      });
      setResult(typeof res === "string" ? res : res?.response || "");
    } catch { setResult("I'm here — try again in a moment."); }
    finally { setLoading(false); }
  };

  const saveResult = () => { if (!result) return; save.mutate({ ...form, citation_style: style, formatted: result }); setResult(""); };
  const copy = (t) => { navigator.clipboard?.writeText(t); toast({ title: "Copied" }); };
  const filtered = filter === "all" ? (citations || []) : (citations || []).filter((c) => c.citation_style === filter);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Citation Manager" />
      <div className="space-y-3">
        <GlassInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <GlassInput label="Authors" value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} placeholder="Last, First; Last, First" />
          <GlassInput label="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Source type</label><select value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })} className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60">{TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}</select></div>
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Style</label><select value={style} onChange={(e) => setStyle(e.target.value)} className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60">{STYLES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <GlassInput label="Publisher (optional)" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
        <GlassInput label="URL (optional — Bud can fetch details)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </div>
      <button onClick={format} disabled={loading} className="w-full h-[52px] mt-4 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap disabled:opacity-50 ice-glow">{loading ? "Formatting…" : "Format citation"}</button>
      {(loading || result) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4">
          {loading ? <BudThinking label="Bud is formatting…" /> : (
            <>
              <p className="text-[13px] text-foreground/90 leading-relaxed">{result}</p>
              <div className="flex gap-3 mt-3"><button onClick={saveResult} className="text-[12px] font-semibold text-primary spring-tap">Save</button><button onClick={() => copy(result)} className="text-[12px] font-semibold text-muted-foreground spring-tap">Copy</button></div>
            </>
          )}
        </motion.div>
      )}
      <div className="flex gap-2 mt-6 mb-3 overflow-x-auto no-scrollbar">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${filter === "all" ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>All</button>
        {STYLES.map((s) => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${filter === s ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{s}</button>)}
      </div>
      {!filtered.length ? <EmptyState message="No saved citations yet." /> : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="glass-card p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase">{c.citation_style}</p>
              <p className="text-[13px] text-foreground/90 leading-relaxed mt-1">{c.formatted}</p>
              <div className="flex gap-3 mt-2"><button onClick={() => copy(c.formatted)} className="text-[11px] font-semibold text-primary spring-tap">Copy</button><button onClick={() => del.mutate(c.id)} className="text-[11px] font-semibold text-destructive spring-tap ml-auto">Delete</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}