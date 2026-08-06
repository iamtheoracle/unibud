import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarClock, Plus, Video, MapPin, Clock, Users, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { OFFICE_HOURS_SLOT_MOCK, OFFICE_HOURS_BOOKING_MOCK } from "@/lib/academic/mockShapes2";
import EmptyState from "@/components/academics/EmptyState";
import OfficeHoursSlotComposer from "@/components/academics/OfficeHoursSlotComposer";
import OfficeHoursBookingModal from "@/components/academics/OfficeHoursBookingModal";
import { useToast } from "@/components/ui/use-toast";
import ScreenShell from "@/components/layout/ScreenShell";

const EASE = [0.16, 1, 0.3, 1];
const today = () => new Date().toISOString().slice(0, 10);

/**
 * OfficeHours — the full office-hours workflow. Students browse and book open
 * slots; lecturers publish slots and review their bookings. Three views:
 * Available, My Bookings, My Slots.
 */
export default function OfficeHours() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState("available");
  const [composer, setComposer] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const slotsQ = useQuery({
    queryKey: ["officeHoursSlots"],
    queryFn: () => base44.entities.OfficeHoursSlot.list("date", 200),
  });
  const { data: slots } = useMockFallback(slotsQ, OFFICE_HOURS_SLOT_MOCK);
  const slotsLoading = slotsQ.isLoading;
  const bookingsQ = useQuery({
    queryKey: ["officeHoursBookings"],
    queryFn: () => base44.entities.OfficeHoursBooking.list("-created_date", 500),
  });
  const { data: bookings } = useMockFallback(bookingsQ, OFFICE_HOURS_BOOKING_MOCK);

  const allSlots = slots || [];
  const allBookings = bookings || [];

  const bookedBySlot = useMemo(() => {
    const m = {};
    allBookings.forEach((b) => { if (b.status === "confirmed") m[b.slot_id] = (m[b.slot_id] || 0) + 1; });
    return m;
  }, [allBookings]);

  const slotById = useMemo(() => {
    const m = {}; allSlots.forEach((s) => { m[s.id] = s; }); return m;
  }, [allSlots]);

  const myBookingFor = (slotId) => allBookings.find((b) => b.slot_id === slotId && b.student_id === user?.id && b.status === "confirmed");

  // Available: open, today or future
  const available = useMemo(() =>
    allSlots.filter((s) => s.status === "open" && (!s.date || s.date >= today())).sort((a, b) => (a.date || "").localeCompare(b.date || "")),
    [allSlots]);

  // My bookings (student)
  const myBookings = useMemo(() =>
    allBookings.filter((b) => b.student_id === user?.id && b.status === "confirmed")
      .map((b) => ({ booking: b, slot: slotById[b.slot_id] }))
      .filter((x) => x.slot)
      .sort((a, b) => (a.slot.date || "").localeCompare(b.slot.date || "")),
    [allBookings, slotById, user]);

  // My slots (lecturer)
  const mySlots = useMemo(() =>
    allSlots.filter((s) => s.created_by_id === user?.id).sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [allSlots, user]);

  async function cancelSlot(s) {
    if (!confirm(`Cancel "${s.title}"? Booked students will lose their slot.`)) return;
    try {
      await base44.entities.OfficeHoursSlot.update(s.id, { status: "cancelled" });
      await qc.invalidateQueries({ queryKey: ["officeHoursSlots"] });
      toast({ title: "Slot cancelled" });
    } catch (err) {
      toast({ title: "Could not cancel", description: err.message, variant: "destructive" });
    }
  }

  const isLecturer = user && mySlots.length > 0;

  return (
    <ScreenShell title="Office Hours" subtitle="Book time with your lecturers, one-on-one or in a group." back
      actions={<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden><CalendarClock className="w-5 h-5 text-primary" /></div>}>

      <div className="flex gap-2 mb-5 p-1 rounded-[16px] bg-muted/40">
        {[
          { key: "available", label: "Available" },
          { key: "mybookings", label: "My Bookings" },
          { key: "myslots", label: "My Slots" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-[12px] text-[12px] font-semibold transition-colors spring-tap ${tab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "available" && (
        <div>
          {slotsLoading ? (
            <div className="h-40 rounded-[24px] glass-card shimmer" />
          ) : available.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No open slots right now" description="Your lecturers haven't posted office hours yet — check back soon." />
          ) : (
            <div className="space-y-3">
              {available.map((s, i) => {
                const count = bookedBySlot[s.id] || 0;
                const full = s.capacity > 0 && count >= s.capacity;
                const mine = myBookingFor(s.id);
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                    className="glass-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-foreground truncate">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground">{s.lecturer_name}{s.course_code ? ` · ${s.course_code}` : ""}</p>
                      </div>
                      {mine ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success">Booked</span>
                        : full ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground">Full</span>
                        : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">Open</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {s.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.start_time}–{s.end_time}</span>
                      {s.location && <span className="flex items-center gap-1">{s.is_virtual ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {s.location}</span>}
                      {s.capacity > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {count}/{s.capacity}</span>}
                    </div>
                    {s.notes && <p className="text-[11px] text-muted-foreground mt-2">{s.notes}</p>}
                    <button onClick={() => setBookingSlot(s)} disabled={!user}
                      className="w-full mt-3 py-2.5 rounded-[14px] bg-primary/10 text-primary font-semibold text-[12px] spring-tap disabled:opacity-50">
                      {mine ? "Manage booking" : full ? "Join waitlist" : "Book this slot"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "mybookings" && (
        <div>
          {myBookings.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No upcoming bookings" description="When you book an office-hours slot, it'll appear here." />
          ) : (
            <div className="space-y-3">
              {myBookings.map(({ booking, slot }, i) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }} className="glass-card p-4">
                  <p className="text-[14px] font-semibold text-foreground truncate">{slot.title}</p>
                  <p className="text-[11px] text-muted-foreground">{slot.lecturer_name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {slot.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {slot.start_time}–{slot.end_time}</span>
                    {slot.location && <span className="flex items-center gap-1">{slot.is_virtual ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {slot.location}</span>}
                  </div>
                  {booking.topic && <p className="text-[11px] text-foreground/80 mt-2">Topic: {booking.topic}</p>}
                  <button onClick={() => setBookingSlot(slot)} className="text-[12px] font-semibold text-primary spring-tap mt-2">Manage</button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "myslots" && (
        <div>
          <div className="flex justify-end mb-3">
            <button onClick={() => setComposer(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
              <Plus className="w-3.5 h-3.5" /> Publish slot
            </button>
          </div>
          {mySlots.length === 0 ? (
            <EmptyState icon={CalendarClock} title="You haven't published slots" description="Publish office hours so students can book time with you." />
          ) : (
            <div className="space-y-4">
              {mySlots.map((s) => {
                const slotBookings = allBookings.filter((b) => b.slot_id === s.id && b.status === "confirmed");
                return (
                  <div key={s.id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-foreground truncate">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground">{s.date} · {s.start_time}–{s.end_time}</p>
                      </div>
                      <button onClick={() => cancelSlot(s)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-error spring-tap"><XCircle className="w-3.5 h-3.5" /> Cancel</button>
                    </div>
                    {slotBookings.length === 0 ? (
                      <p className="text-[12px] text-muted-foreground mt-3">No bookings yet.</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <p className="text-[11px] font-semibold text-muted-foreground">{slotBookings.length} booking{slotBookings.length === 1 ? "" : "s"}</p>
                        {slotBookings.map((b) => (
                          <div key={b.id} className="flex items-center gap-2 p-2.5 rounded-[12px] bg-muted/30">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[12px] font-semibold overflow-hidden shrink-0">
                              {b.student_image ? <img src={b.student_image} alt="" className="w-full h-full object-cover" loading="lazy" /> : (b.student_name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-semibold text-foreground truncate">{b.student_name}</p>
                              {b.topic && <p className="text-[10px] text-muted-foreground truncate">{b.topic}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <OfficeHoursSlotComposer open={composer} onClose={() => setComposer(false)} user={user} />
      <OfficeHoursBookingModal open={!!bookingSlot} onClose={() => setBookingSlot(null)} slot={bookingSlot} user={user}
        alreadyBooked={bookingSlot ? myBookingFor(bookingSlot.id) : null}
        full={bookingSlot ? bookingSlot.capacity > 0 && (bookedBySlot[bookingSlot.id] || 0) >= bookingSlot.capacity : false} />
    </ScreenShell>
  );
}