import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { FolderOpen, Plus, Trash2, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const TYPES = ["policy", "handbook", "calendar", "form", "letter", "template", "circular", "minutes", "accreditation", "report"];

export default function PortalDocuments({ institution }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", type: "policy", description: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => { setLoading(true); try { setDocs(await base44.entities.InstitutionDocument.filter({ institution_id: institution.id })); } catch {} finally { setLoading(false); } };
  useEffect(() => { if (institution?.id) load(); }, [institution?.id]);

  const add = async () => {
    if (!form.title.trim()) { toast({ title: "Title required" }); return; }
    setUploading(true);
    try {
      let file_url = "";
      if (file) { const res = await base44.integrations.Core.UploadFile({ file }); file_url = res.file_url; }
      await base44.entities.InstitutionDocument.create({ ...form, file_url, institution_id: institution.id });
      setForm({ title: "", type: "policy", description: "" }); setFile(null);
      load(); toast({ title: "Document added" });
    } catch { toast({ title: "Upload failed" }); }
    finally { setUploading(false); }
  };
  const remove = async (id) => { try { await base44.entities.InstitutionDocument.delete(id); load(); } catch {} };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2"><FolderOpen className="w-5 h-5 text-primary" /><h1 className="text-[20px] font-heading font-bold">Document Center</h1></div>

      <div className="glass-card radius-lg p-4 space-y-3">
        <p className="text-[13px] font-heading font-semibold">Upload document</p>
        <div className="grid md:grid-cols-2 gap-2">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        <div><Label>File</Label><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-[13px]" /></div>
        <Button onClick={add} disabled={uploading}>{uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Uploading…</> : <><Plus className="w-4 h-4 mr-1" />Add document</>}</Button>
      </div>

      <div>
        <p className="text-[13px] font-heading font-semibold mb-2">Documents ({docs.length})</p>
        {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : docs.length === 0 ? <p className="text-muted-foreground text-[13px]">No documents yet.</p> :
          <div className="space-y-2">{docs.map((d) => (
            <div key={d.id} className="glass-card radius-lg p-3 flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] truncate">{d.title}</p><p className="text-[12px] text-muted-foreground capitalize">{d.type} · {d.description || "—"}</p></div>
              {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[12px] text-primary font-semibold">Open</a>}
              <button onClick={() => remove(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}</div>}
      </div>
    </div>
  );
}