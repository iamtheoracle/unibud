import React, { useState } from "react";
import { Loader2, Upload, BadgeCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { VERIFICATION_TYPES } from "@/lib/identity/useIdentity";

/**
 * VerificationComposer — submit a verification request (student ID, role,
 * lecturer, department, faculty, university, campus business) with optional
 * supporting evidence.
 */
export default function VerificationComposer({ onSubmit, loading }) {
  const [target_type, setType] = useState(VERIFICATION_TYPES[0].key);
  const [target_name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [evidence_url, setEvidence] = useState("");
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setEvidence(file_url);
    } catch {
      /* ignore — evidence is optional */
    } finally {
      setUploading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ target_type, target_name: target_name.trim(), evidence_url, notes: notes.trim() });
    setName("");
    setNotes("");
    setEvidence("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-[18px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap ice-glow"
      >
        <BadgeCheck className="w-4 h-4" /> Request Verification
      </button>
    );
  }

  const selected = VERIFICATION_TYPES.find((t) => t.key === target_type);

  return (
    <form onSubmit={submit} className="rounded-[20px] p-4 glass-card space-y-3">
      <label className="space-y-1">
        <span className="text-[11px] font-semibold text-muted-foreground">Verification Type</span>
        <select value={target_type} onChange={(e) => setType(e.target.value)} className="oracle-input">
          {VERIFICATION_TYPES.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
        {selected && <span className="text-[10px] text-muted-foreground/80 block mt-0.5">{selected.desc}</span>}
      </label>
      <label className="space-y-1">
        <span className="text-[11px] font-semibold text-muted-foreground">Name / Title (optional)</span>
        <input value={target_name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Department of Computer Science" className="oracle-input" />
      </label>
      <label className="space-y-1">
        <span className="text-[11px] font-semibold text-muted-foreground">Notes (optional)</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything reviewers should know" className="oracle-input min-h-[44px] py-2" />
      </label>
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-muted-foreground">Supporting Evidence (optional)</span>
        <label className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] bg-muted/40 border border-border cursor-pointer spring-tap">
          <Upload className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] text-muted-foreground flex-1 truncate">
            {evidence_url ? "Evidence attached" : uploading ? "Uploading…" : "Upload document / ID"}
          </span>
          <input type="file" accept="image/*,application/pdf" onChange={onFile} className="hidden" />
        </label>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-[14px] bg-muted/50 text-[12px] font-semibold text-muted-foreground spring-tap">Cancel</button>
        <button type="submit" disabled={loading || uploading} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap disabled:opacity-50">
          {loading || uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />} Submit
        </button>
      </div>
    </form>
  );
}