import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { queryClientInstance } from "@/lib/query-client";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const FIELDS = [
  { key: "full_name", label: "Full Name" },
  { key: "matriculation_number", label: "Matric Number" },
  { key: "department", label: "Department" },
  { key: "faculty", label: "Faculty" },
  { key: "university", label: "University" },
  { key: "level", label: "Academic Level" },
  { key: "semester", label: "Semester" },
];

export default function EditProfileModal({ open, onClose, user }) {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      const v = {};
      FIELDS.forEach((f) => (v[f.key] = user[f.key] || ""));
      setValues(v);
    }
  }, [open, user]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setValues((v) => ({ ...v, avatar_url: file_url }));
      toast({ title: "Photo uploaded" });
    } catch {
      toast({ title: "Upload failed", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ ...values });
      await queryClientInstance.invalidateQueries({ queryKey: ["me"] });
      toast({ title: "Profile updated" });
      onClose();
    } catch (e) {
      toast({ title: "Update failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb max-h-[88vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-[18px] text-foreground">Edit Profile</h2>
              <button onClick={onClose} className="text-[13px] font-semibold text-muted-foreground">Close</button>
            </div>
            <div className="space-y-3.5">
              {FIELDS.map((f) => (
                <GlassInput key={f.key} label={f.label} value={values[f.key] || ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              ))}
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Profile Photo</label>
                <label className="mt-1.5 flex items-center gap-3 h-[52px] px-4 rounded-2xl bg-muted/50 border border-border cursor-pointer">
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  <span className="text-[13px] text-muted-foreground flex-1">
                    {values.avatar_url ? "Photo selected — tap to change" : "Tap to upload a photo"}
                  </span>
                </label>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow"
            >
              {loading ? <span className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> : "Save Changes"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}