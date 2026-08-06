import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { X, Plus, Trash2, Loader2, GraduationCap } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TutorProfileComposer({ user, onClose, existing }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    role: existing?.role || "student",
    bio: existing?.bio || "",
    subjects: (existing?.subjects || []).join(", "),
    course_codes: (existing?.course_codes || []).join(", "),
    department: existing?.department || user?.data?.department || "",
    faculty: existing?.faculty || user?.data?.faculty || "",
    hourly_rate: existing?.hourly_rate || 0,
    is_free: existing?.is_free ?? false,
    teaching_style: existing?.teaching_style || "One-on-one",
    languages: (existing?.languages || []).join(", "),
  });
  const [slots, setSlots] = useState(existing?.availability || []);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const addSlot = () => setSlots([...slots, { day: "Monday", start: "10:00", end: "12:00" }]);
  const updateSlot = (i, key, val) => setSlots(slots.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  const removeSlot = (i) => setSlots(slots.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        tutor_name: user.full_name,
        tutor_id: user.id,
        role: form.role,
        bio: form.bio,
        subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        course_codes: form.course_codes.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
        department: form.department,
        faculty: form.faculty,
        hourly_rate: Number(form.hourly_rate) || 0,
        is_free: form.is_free,
        teaching_style: form.teaching_style,
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
        availability: slots,
        status: "active",
        institution_id: user?.data?.institution_id,
      };
      if (existing?.id) {
        await base44.entities.TutorProfile.update(existing.id, payload);
      } else {
        await base44.entities.TutorProfile.create(payload);
      }
      qc.invalidateQueries({ queryKey: ["tutorProfiles"] });
      toast({ title: existing ? "Profile updated" : "Tutor profile created" });
      onClose();
    } catch {
      toast({ title: "Couldn't save", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <motion.div className="fixed inset-0 z-[2100] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] glass-strong no-scrollbar"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2 bg-border" />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center spring-tap">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="p-5 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-[17px] font-bold text-foreground">{existing ? "Edit Tutor Profile" : "Become a Tutor"}</h2>
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">I am a</label>
            <div className="flex gap-2">
              {["student", "ta", "lecturer"].map((r) => (
                <button key={r} onClick={() => set("role", r)}
                  className={`flex-1 py-2 rounded-[10px] text-[11px] font-semibold spring-tap capitalize ${form.role === r ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground border border-border/30"}`}>
                  {r === "ta" ? "Teaching Assistant" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bio</label>
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={2} placeholder="Tell students about your expertise and teaching approach..." className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40 resize-none" />
          </div>

          {/* Subjects */}
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Subjects (comma-separated)</label>
            <input value={form.subjects} onChange={(e) => set("subjects", e.target.value)} placeholder="Mathematics, Physics, Programming" className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40" />
          </div>

          {/* Course codes */}
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Course Codes (comma-separated)</label>
            <input value={form.course_codes} onChange={(e) => set("course_codes", e.target.value)} placeholder="MTH101, CSC201" className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40" />
          </div>

          {/* Department & Faculty */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Department</label>
              <input value={form.department} onChange={(e) => set("department", e.target.value)} className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Faculty</label>
              <input value={form.faculty} onChange={(e) => set("faculty", e.target.value)} className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40" />
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pricing</label>
              <button onClick={() => set("is_free", !form.is_free)} className={`px-2 py-0.5 rounded-full text-[9px] font-bold spring-tap ${form.is_free ? "bg-success text-success-foreground" : "bg-muted/30 text-muted-foreground"}`}>
                {form.is_free ? "✓ Free" : "Paid"}
              </button>
            </div>
            {!form.is_free && (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-muted-foreground">₦</span>
                <input type="number" value={form.hourly_rate} onChange={(e) => set("hourly_rate", e.target.value)} placeholder="5000" className="flex-1 px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40" />
                <span className="text-[11px] text-muted-foreground">/hr</span>
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Weekly Availability</label>
              <button onClick={addSlot} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold spring-tap flex items-center gap-0.5">
                <Plus className="w-2.5 h-2.5" /> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <select value={slot.day} onChange={(e) => updateSlot(i, "day", e.target.value)} className="px-2 py-1.5 rounded-[8px] bg-muted/30 border border-border/30 text-[11px] text-foreground outline-none flex-1">
                    {DAYS.map((d) => <option key={d} value={d}>{d.slice(0, 3)}</option>)}
                  </select>
                  <input type="time" value={slot.start} onChange={(e) => updateSlot(i, "start", e.target.value)} className="px-2 py-1.5 rounded-[8px] bg-muted/30 border border-border/30 text-[11px] text-foreground outline-none" />
                  <span className="text-[10px] text-muted-foreground">–</span>
                  <input type="time" value={slot.end} onChange={(e) => updateSlot(i, "end", e.target.value)} className="px-2 py-1.5 rounded-[8px] bg-muted/30 border border-border/30 text-[11px] text-foreground outline-none" />
                  <button onClick={() => removeSlot(i)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive spring-tap">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Languages (comma-separated)</label>
            <input value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="English, Yoruba" className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40" />
          </div>

          <button onClick={handleSubmit} disabled={saving} className="w-full py-3 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
            {existing ? "Save Changes" : "Create Profile"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}