import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Package, MapPin, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LOST_FOUND_CATEGORIES, getIcon } from "./campusConstants";

const CATEGORIES = Object.entries(LOST_FOUND_CATEGORIES);

export default function LostFoundReportModal({ open, onClose, user, onCreated }) {
  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("electronics");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setType("lost");
    setTitle("");
    setDescription("");
    setCategory("electronics");
    setLocation("");
    setDate(new Date().toISOString().split("T")[0]);
    setImagePreview(null);
    setImageUrl(null);
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
    } catch {
      // ignore
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !user) return;
    setSubmitting(true);
    try {
      const accentColor = type === "lost" ? "0 73% 51%" : "142 72% 29%";
      const created = await base44.entities.LostFoundItem.create({
        title: title.trim(),
        description: description.trim(),
        type,
        category,
        location: location.trim(),
        date_lost_found: date,
        image_url: imageUrl,
        reporter_name: user.full_name || "You",
        reporter_id: user.id,
        reporter_image: user.avatar_url || user.image || "",
        status: "active",
        university: user.university || "",
        accent_color: accentColor,
      });
      reset();
      onCreated?.(created);
      onClose();
    } catch {
      // error
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card rounded-t-[28px] max-h-[88vh] overflow-y-auto no-scrollbar"
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur z-10 px-5 pt-4 pb-3 border-b border-border/30 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-[17px] text-foreground">Report Item</h2>
                <p className="text-[11px] text-muted-foreground">Help the campus community</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Type Toggle */}
              <div className="bg-muted/50 rounded-[16px] p-1.5 flex">
                {["lost", "found"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={
                      "flex-1 py-2.5 rounded-[12px] text-[12px] font-semibold capitalize transition-all spring-tap " +
                      (type === t
                        ? t === "lost"
                          ? "bg-error text-error-foreground soft-shadow"
                          : "bg-success text-success-foreground soft-shadow"
                        : "text-muted-foreground")
                    }
                  >
                    {t === "lost" ? "🔍 I Lost Something" : "✋ I Found Something"}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Item Name</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black Samsung Phone"
                  className="w-full px-3.5 py-3 rounded-[14px] bg-muted/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item, distinguishing features, etc."
                  rows={2}
                  className="w-full px-3.5 py-3 rounded-[14px] bg-muted/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(([key, meta]) => {
                    const CatIcon = getIcon(meta.icon);
                    return (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={
                          "px-3 py-2 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all spring-tap " +
                          (category === key
                            ? "bg-primary text-primary-foreground soft-shadow"
                            : "bg-muted/40 text-muted-foreground border border-border/40")
                        }
                      >
                        <CatIcon className="w-3 h-3" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Library"
                      className="w-full pl-9 pr-3 py-2.5 rounded-[14px] bg-muted/40 border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-2.5 rounded-[14px] bg-muted/40 border border-border/40 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Photo (optional)</label>
                {imagePreview ? (
                  <div className="relative w-full h-32 rounded-[14px] overflow-hidden">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setImagePreview(null); setImageUrl(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 rounded-[14px] bg-muted/40 border-2 border-dashed border-border/50 cursor-pointer spring-tap hover:bg-muted/60">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground">Upload photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  </label>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || submitting}
                className="w-full py-3.5 rounded-[16px] bg-primary text-primary-foreground font-heading font-semibold text-[14px] spring-tap disabled:opacity-50 gold-glow flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                {submitting ? "Posting..." : `Report ${type === "lost" ? "Lost" : "Found"} Item`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}