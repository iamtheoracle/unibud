import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

/**
 * OfficeHoursSlotComposer — lecturer publishes an office-hours slot.
 */
export default function OfficeHoursSlotComposer({ open, onClose, user }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim() || !date || !startTime || !endTime) return toast({ title: "Title, date and times are required", variant: "destructive" });
    setSaving(true);
    try {
      await base44.entities.OfficeHoursSlot.create({
        lecturer_id: user.id,
        lecturer_name: user.full_name || user.email,
        lecturer_image: user.avatar_url || user.image || "",
        course_code: courseCode.trim(),
        title: title.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        is_virtual: isVirtual,
        location: location.trim(),
        capacity: Number(capacity) || 0,
        notes: notes.trim(),
        status: "open",
      });
      await queryClientInstance.invalidateQueries({ queryKey: ["officeHoursSlots"] });
      toast({ title: "Office hours published" });
      onClose();
      setTitle(""); setCourseCode(""); setDate(""); setStartTime(""); setEndTime(""); setLocation(""); setCapacity(1); setNotes(""); setIsVirtual(false);
    } catch (err) {
      toast({ title: "Could not publish", description: err.message, variant: "destructive" });
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
              <h3 className="font-heading font-bold text-[16px] text-foreground">Publish office hours</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <label className="text-[12px] font-semibold text-foreground">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 4 Office Hours"
              className="w-full h-12 mt-1.5 px-4 rounded-[16px] bg-muted/30 border border-border/40 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />

            <label className="text-[12px] font-semibold text-foreground mt-3 block">Course (optional)</label>
            <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="CSC 301"
              className="w-full h-11 mt-1.5 px-4 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-[12px] font-semibold text-foreground">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-11 mt-1.5 px-2 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground">Start</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full h-11 mt-1.5 px-2 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground">End</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full h-11 mt-1.5 px-2 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => setIsVirtual((v) => !v)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold spring-tap ${isVirtual ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>{isVirtual ? "Virtual" : "In person"}</button>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={isVirtual ? "Video link" : "Room / office"}
                className="flex-1 h-10 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[12px] font-semibold text-foreground">Capacity (0 = unlimited)</label>
                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground">Notes (optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What to bring"
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>

            <button onClick={save} disabled={saving}
              className="w-full mt-5 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Publishing…" : "Publish slot"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}