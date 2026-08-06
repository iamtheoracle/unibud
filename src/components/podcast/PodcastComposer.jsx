import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

/**
 * PodcastComposer — a creator starts a new podcast show.
 */
export default function PodcastComposer({ open, onClose, user }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cover, setCover] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCover(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const r = await base44.integrations.Core.UploadFile({ file: f });
      setCover(r.file_url);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!title.trim()) return toast({ title: "Add a title", variant: "destructive" });
    setSaving(true);
    try {
      await base44.entities.Podcast.create({
        title: title.trim(),
        description: description.trim(),
        cover_url: cover,
        host_name: user?.full_name || user?.email || "",
        host_id: user?.id || "",
        category: category.trim(),
        status: "published",
      });
      await queryClientInstance.invalidateQueries({ queryKey: ["podcasts"] });
      toast({ title: "Podcast created" });
      onClose();
      setTitle(""); setDescription(""); setCategory(""); setCover("");
    } catch (err) {
      toast({ title: "Could not create", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-card soft-shadow border border-border/40 p-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Start a podcast</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <label className="text-[12px] font-semibold text-foreground">Show title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Midnight Lecture"
              className="w-full h-12 mt-1.5 px-4 rounded-[16px] bg-muted/30 border border-border/40 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />

            <label className="text-[12px] font-semibold text-foreground mt-3 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What's this show about?"
              className="w-full mt-1.5 p-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50 resize-y" />

            <label className="text-[12px] font-semibold text-foreground mt-3 block">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Academics, Tech, Student Life…"
              className="w-full h-11 mt-1.5 px-4 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />

            <label className="text-[12px] font-semibold text-foreground mt-3 block">Cover art</label>
            {cover ? (
              <div className="relative mt-1.5">
                <img src={cover} alt="" className="w-full h-32 rounded-[14px] object-cover" />
                <button onClick={() => setCover("")} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 mt-1.5 py-4 rounded-[14px] border-2 border-dashed border-border/50 text-[12px] text-muted-foreground spring-tap cursor-pointer">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                {uploading ? "Uploading…" : "Upload cover image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
              </label>
            )}

            <button onClick={save} disabled={saving || uploading}
              className="w-full mt-5 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Creating…" : "Create show"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}