import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Video, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

/**
 * OfficeHoursBookingModal — student books an office-hours slot.
 */
export default function OfficeHoursBookingModal({ open, onClose, slot, user, alreadyBooked, full }) {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function book() {
    if (!slot) return;
    setSaving(true);
    try {
      await base44.entities.OfficeHoursBooking.create({
        slot_id: slot.id,
        lecturer_id: slot.lecturer_id,
        student_id: user.id,
        student_name: user.full_name || user.email,
        student_image: user.avatar_url || user.image || "",
        course_code: slot.course_code || "",
        topic: topic.trim(),
        notes: notes.trim(),
        status: "confirmed",
      });
      await queryClientInstance.invalidateQueries({ queryKey: ["officeHoursBookings"] });
      toast({ title: "Booking confirmed" });
      onClose();
      setTopic(""); setNotes("");
    } catch (err) {
      toast({ title: "Could not book", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function cancelBooking() {
    if (!alreadyBooked) return;
    setSaving(true);
    try {
      await base44.entities.OfficeHoursBooking.update(alreadyBooked.id, { status: "cancelled" });
      await queryClientInstance.invalidateQueries({ queryKey: ["officeHoursBookings"] });
      toast({ title: "Booking cancelled" });
      onClose();
    } catch (err) {
      toast({ title: "Could not cancel", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const disabled = full && !alreadyBooked;

  return (
    <AnimatePresence>
      {open && slot && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-card soft-shadow border border-border/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-[16px] text-foreground truncate">{slot.title}</h3>
                <p className="text-[11px] text-muted-foreground">{slot.lecturer_name}{slot.course_code ? ` · ${slot.course_code}` : ""}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap shrink-0"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="flex flex-wrap gap-3 text-[12px] text-muted-foreground mb-3">
              <span>{slot.date}</span>
              <span>{slot.start_time}–{slot.end_time}</span>
              {slot.location && (
                <span className="flex items-center gap-1">
                  {slot.is_virtual ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {slot.location}
                </span>
              )}
            </div>

            {alreadyBooked ? (
              <div className="p-3 rounded-[16px] bg-success/8 border border-success/15 mb-4">
                <p className="text-[13px] font-semibold text-success">You're booked for this slot.</p>
                {alreadyBooked.topic && <p className="text-[12px] text-foreground/80 mt-1">Topic: {alreadyBooked.topic}</p>}
              </div>
            ) : (
              <>
                <label className="text-[12px] font-semibold text-foreground">What do you want to discuss?</label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Clarify AVL tree rotations"
                  className="w-full h-11 mt-1.5 px-4 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
                <label className="text-[12px] font-semibold text-foreground mt-3 block">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="w-full mt-1.5 p-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
              </>
            )}

            {alreadyBooked ? (
              <button onClick={cancelBooking} disabled={saving}
                className="w-full mt-2 py-3.5 rounded-[18px] bg-error/10 text-error border border-error/20 font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Cancelling…" : "Cancel my booking"}
              </button>
            ) : (
              <button onClick={book} disabled={saving || disabled}
                className="w-full mt-4 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {disabled ? "This slot is full" : saving ? "Booking…" : "Confirm booking"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}