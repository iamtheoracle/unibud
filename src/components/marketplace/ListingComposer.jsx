import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Loader2, Tag, Gift } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";

const CATEGORIES = [
  { key: "textbooks", label: "Textbooks", icon: "📚" },
  { key: "electronics", label: "Electronics", icon: "💻" },
  { key: "furniture", label: "Furniture", icon: "🪑" },
  { key: "accommodation", label: "Accommodation", icon: "🏠" },
  { key: "tutoring", label: "Tutoring", icon: "🎓" },
  { key: "services", label: "Services", icon: "⚡" },
  { key: "tickets", label: "Tickets", icon: "🎫" },
  { key: "other", label: "Other", icon: "📦" },
];

const CONDITIONS = [
  { key: "new", label: "New" },
  { key: "like_new", label: "Like New" },
  { key: "good", label: "Good" },
  { key: "fair", label: "Fair" },
];

export default function ListingComposer({ open, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me(), retry: false });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("textbooks");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [condition, setCondition] = useState("good");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle(""); setCategory("textbooks"); setPrice(""); setIsFree(false); setCondition("good");
    setLocation(""); setDescription(""); setContact(""); setImageUrl("");
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
    } catch {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!title.trim()) return toast({ title: "Add a title", description: "Give your listing a short title.", variant: "destructive" });
    if (!isFree && (!price || Number(price) < 0)) return toast({ title: "Add a price", description: "Enter a price in ₦, or mark it free.", variant: "destructive" });
    if (!contact.trim()) return toast({ title: "Add contact", description: "Buyers need a way to reach you (phone, WhatsApp, or handle).", variant: "destructive" });
    setSubmitting(true);
    try {
      await base44.entities.MarketplaceListing.create({
        title: title.trim(),
        description: description.trim(),
        price: isFree ? 0 : Number(price),
        is_free: isFree,
        category,
        condition,
        location: location.trim(),
        contact: contact.trim(),
        images: imageUrl ? [imageUrl] : [],
        seller_name: user?.full_name || "Student",
        seller_image: user?.avatar_url || "",
        status: "active",
      });
      hapticTap();
      toast({ title: "Listing published 🎉", description: "Your item is live on the campus marketplace." });
      reset();
      qc.invalidateQueries({ queryKey: ["marketplaceListings"] });
      onClose();
    } catch {
      toast({ title: "Could not publish", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm safe-area-px"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] glass-strong p-5 safe-area-pb"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-[18px] text-foreground">List an item</h3>
                <p className="text-[11.5px] text-muted-foreground">Free to list · No fees · Connect directly with students</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image */}
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-[18px] bg-muted/40 border border-border/40 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" loading="lazy" />
                  ) : uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                  <div className="rounded-[14px] p-3 glass text-center spring-tap">
                    <p className="text-[12px] font-semibold text-foreground">{imageUrl ? "Change photo" : "Add a photo"}</p>
                    <p className="text-[10px] text-muted-foreground">Optional · helps it sell faster</p>
                  </div>
                </label>
              </div>

              {/* Title */}
              <Field label="Title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Engineering Mathematics textbook" className="input-base" />
              </Field>

              {/* Category */}
              <Field label="Category">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {CATEGORIES.map((c) => (
                    <button key={c.key} onClick={() => setCategory(c.key)}
                      className={`flex-shrink-0 px-3 py-2 rounded-full text-[12px] font-semibold spring-tap flex items-center gap-1.5 ${
                        category === c.key ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                      }`}>
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Price + free toggle */}
              <Field label="Price">
                <div className="flex gap-2.5 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted-foreground">₦</span>
                    <input type="number" value={price} disabled={isFree} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="input-base pl-8 disabled:opacity-50" />
                  </div>
                  <button onClick={() => { setIsFree((v) => !v); if (!isFree) setPrice(""); }}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-[14px] text-[12px] font-semibold spring-tap ${
                      isFree ? "bg-success text-success-foreground" : "glass text-muted-foreground"
                    }`}>
                    <Gift className="w-4 h-4" /> Free
                  </button>
                </div>
              </Field>

              {/* Condition */}
              <Field label="Condition">
                <div className="flex gap-2">
                  {CONDITIONS.map((c) => (
                    <button key={c.key} onClick={() => setCondition(c.key)}
                      className={`flex-1 py-2 rounded-[12px] text-[12px] font-semibold spring-tap ${
                        condition === c.key ? "bg-foreground text-background" : "glass text-muted-foreground"
                      }`}>{c.label}</button>
                  ))}
                </div>
              </Field>

              {/* Location */}
              <Field label="Location">
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main Campus, Faculty of Eng." className="input-base" />
              </Field>

              {/* Contact */}
              <Field label="Contact" hint="How buyers reach you — no payment needed">
                <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone, WhatsApp, or handle" className="input-base" />
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the item, condition details, etc." className="input-base" />
              </Field>

              <button onClick={submit} disabled={submitting}
                className="w-full py-3.5 rounded-[16px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                Publish listing — free
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">{label}</label>
        {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}