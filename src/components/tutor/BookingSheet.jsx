import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { X, Calendar, Clock, BookOpen, Loader2, CreditCard } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function BookingSheet({ tutor, user, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [courseCode, setCourseCode] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  const availableSlots = useMemo(() => {
    if (!date) return [];
    const dayName = new Date(date + "T00:00:00").toLocaleDateString("en", { weekday: "long" });
    return (tutor.availability || []).filter((s) => s.day === dayName);
  }, [date, tutor.availability]);

  const price = tutor.is_free ? 0 : Math.round((tutor.hourly_rate || 0) * duration / 60);

  const handleSubmit = async () => {
    if (!date || !time) {
      toast({ title: "Please select date and time", variant: "destructive" });
      return;
    }
    if (window.self !== window.top && !tutor.is_free) {
      alert("Payment works only from a published app. Please open UNIBUD in a new tab.");
      return;
    }

    setSubmitting(true);
    try {
      if (!tutor.is_free && price > 0) {
        const res = await base44.functions.invoke("purchaseTutorSession", {
          tutor_profile_id: tutor.id,
          session_date: date,
          session_time: time,
          duration_minutes: duration,
        });
        if (res.data?.checkout_url) {
          window.location.href = res.data.checkout_url;
          return;
        }
      }

      await base44.entities.TutorBooking.create({
        tutor_profile_id: tutor.id,
        tutor_id: tutor.tutor_id,
        tutor_name: tutor.tutor_name,
        student_id: user.id,
        student_name: user.full_name,
        course_code: courseCode,
        topic,
        session_date: date,
        session_time: time,
        duration_minutes: duration,
        price,
        is_paid: tutor.is_free,
        status: tutor.is_free ? "pending" : "pending",
        institution_id: user?.data?.institution_id,
      });
      qc.invalidateQueries({ queryKey: ["tutorBookings"] });
      toast({ title: "Session requested!", description: `${tutor.tutor_name} will confirm shortly.` });
      onClose();
    } catch (err) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
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
          <h2 className="text-[17px] font-bold text-foreground mb-1">Book a Session</h2>
          <p className="text-[12px] text-muted-foreground mb-4">with {tutor.tutor_name} · {tutor.is_free ? "Free" : `₦${(tutor.hourly_rate || 0).toLocaleString()}/hr`}</p>

          {/* Course code */}
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Course Code (optional)
            </label>
            <input
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. MTH101"
              className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40"
            />
          </div>

          {/* Topic */}
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you need help with?"
              className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40"
            />
          </div>

          {/* Date */}
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => { setDate(e.target.value); setTime(""); }}
              className="w-full px-3 py-2.5 rounded-[12px] bg-muted/30 border border-border/30 text-[13px] text-foreground outline-none focus:border-primary/40"
            />
          </div>

          {/* Available slots */}
          {date && availableSlots.length > 0 && (
            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Available Times
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSlots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setTime(slot.start)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap ${time === slot.start ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground border border-border/30"}`}
                  >
                    {slot.start} – {slot.end}
                  </button>
                ))}
              </div>
            </div>
          )}
          {date && availableSlots.length === 0 && (
            <p className="text-[11px] text-muted-foreground mb-3">No availability on this day. Try another date.</p>
          )}

          {/* Duration */}
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-[10px] text-[12px] font-semibold spring-tap ${duration === d ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground border border-border/30"}`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Price summary */}
          <div className="glass-card p-3 rounded-[14px] mb-4 flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Total</span>
            <span className="text-[16px] font-bold text-primary">{tutor.is_free ? "Free" : `₦${price.toLocaleString()}`}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !date || !time}
            className="w-full py-3 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : tutor.is_free ? <Calendar className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            {tutor.is_free ? "Request Session" : `Pay & Book · ₦${price.toLocaleString()}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}