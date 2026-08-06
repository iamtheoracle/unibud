import React, { useState } from "react";
import { Paperclip, X, Link2, Pin, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";

const AUDIENCES = ["entire_university", "faculty", "department", "course", "class", "lecturers", "students"];
const PRIORITIES = ["low", "normal", "high", "urgent"];
const TARGETED = ["faculty", "department", "course", "class"];

const nowLocal = () => {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16);
};

/**
 * AnnouncementComposer — institution announcement authoring with scheduling,
 * attachments, call-to-action link, expiration and pinning.
 */
export default function AnnouncementComposer({ institution, onPublished }) {
  const [form, setForm] = useState({ title: "", message: "", audience: "entire_university", target_name: "", priority: "normal", status: "published", publish_date: "", expires_at: "", link_url: "", pinned: false });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { url: file_url, name: file.name, type: file.type };
      }));
      setAttachments((a) => [...a, ...uploaded]);
    } catch { toast({ title: "Attachment upload failed" }); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const removeAttachment = (i) => setAttachments((a) => a.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!form.title || !form.message) { toast({ title: "Title and message required" }); return; }
    if (form.status === "scheduled" && !form.publish_date) { toast({ title: "Pick a publish time to schedule" }); return; }
    setSaving(true);
    try {
      await base44.entities.StaffAnnouncement.create({
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        target_name: TARGETED.includes(form.audience) ? form.target_name.trim() : "",
        priority: form.priority,
        status: form.status,
        publish_date: form.status === "scheduled" ? new Date(form.publish_date).toISOString() : undefined,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : undefined,
        link_url: form.link_url.trim() || undefined,
        pinned: form.pinned,
        attachments,
        institution_id: institution.id,
        author_name: institution.short_name || institution.name,
      });
      setForm({ title: "", message: "", audience: "entire_university", target_name: "", priority: "normal", status: "published", publish_date: "", expires_at: "", link_url: "", pinned: false });
      setAttachments([]);
      toast({ title: form.status === "scheduled" ? "Announcement scheduled" : "Announcement published" });
      onPublished?.();
    } catch { toast({ title: "Failed to save announcement" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="glass-card radius-lg p-4 space-y-3">
      <UDSInput label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Announcement headline" />
      <div>
        <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Message</span>
        <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} className="w-full mt-1 p-3 rounded-xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60" placeholder="What should your students know?" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Audience" value={form.audience} onChange={(v) => set("audience", v)} options={AUDIENCES} />
        <Field label="Priority" value={form.priority} onChange={(v) => set("priority", v)} options={PRIORITIES} />
      </div>
      {TARGETED.includes(form.audience) && <UDSInput label={`Target ${form.audience} name`} value={form.target_name} onChange={(e) => set("target_name", e.target.value)} placeholder={`e.g. Faculty of Science`} />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status" value={form.status} onChange={(v) => set("status", v)} options={["draft", "published", "scheduled"]} />
        {form.status === "scheduled" && (
          <div>
            <span className="text-[12px] font-semibold text-muted-foreground ml-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />Publish at</span>
            <input type="datetime-local" value={form.publish_date} onChange={(e) => set("publish_date", e.target.value)} min={nowLocal()} className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Expires at (optional)</span>
          <input type="datetime-local" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60" />
        </div>
        <UDSInput label="Call-to-action link (optional)" value={form.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="https://…" />
      </div>

      {/* Attachments */}
      <div>
        <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Attachments</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {attachments.map((a, i) => (
            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/60 text-[12px]">
              <Paperclip className="w-3 h-3" />{a.name}
              <button onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          ))}
          <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-dashed border-border text-[12px] cursor-pointer hover:bg-muted/60 ${uploading ? "opacity-60" : ""}`}>
            <Paperclip className="w-3 h-3" />{uploading ? "Uploading…" : "Add file"}
            <input type="file" multiple onChange={onFiles} className="hidden" />
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
        <input type="checkbox" checked={form.pinned} onChange={(e) => set("pinned", e.target.checked)} className="w-4 h-4 rounded accent-primary" />
        <Pin className="w-3.5 h-3.5" />Pin to top of student announcements
      </label>

      <div className="flex items-center gap-2">
        <UDSButton onClick={submit} disabled={saving || uploading}>
          {saving ? "Saving…" : form.status === "scheduled" ? "Schedule" : form.status === "draft" ? "Save draft" : "Publish"}
        </UDSButton>
        <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, options }) => (
  <div>
    <span className="text-[12px] font-semibold text-muted-foreground ml-0.5 capitalize">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/40 border border-border text-[14px] capitalize focus:outline-none focus:border-primary/60">
      {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
    </select>
  </div>
);