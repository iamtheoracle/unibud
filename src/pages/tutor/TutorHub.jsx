import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, GraduationCap, Shield, Star } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import TutorCard from "@/components/tutor/TutorCard";
import TutorDetailSheet from "@/components/tutor/TutorDetailSheet";
import BookingSheet from "@/components/tutor/BookingSheet";
import BudTutorRecommendations from "@/components/tutor/BudTutorRecommendations";
import TutorProfileComposer from "@/components/tutor/TutorProfileComposer";

const FILTERS = ["All", "Verified", "Lecturers", "Teaching Assistants", "Free", "Top Rated"];

export default function TutorHub() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [bookingTutor, setBookingTutor] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: tutors, isLoading } = useQuery({
    queryKey: ["tutorProfiles"],
    queryFn: () => base44.entities.TutorProfile.filter({ status: "active" }, "-rating,-reviews_count", 50),
  });

  // Handle payment redirect
  useEffect(() => {
    if (!user?.id) return;
    const params = new URLSearchParams(window.location.search);
    const paidTutorId = params.get("paid");
    if (paidTutorId) {
      const date = params.get("date");
      const time = params.get("time");
      const duration = parseInt(params.get("duration") || "60");
      base44.entities.TutorProfile.get(paidTutorId).then((tutor) => {
        base44.entities.TutorBooking.create({
          tutor_profile_id: paidTutorId,
          tutor_id: tutor.tutor_id,
          tutor_name: tutor.tutor_name,
          student_id: user.id,
          student_name: user.full_name,
          session_date: date,
          session_time: time,
          duration_minutes: duration,
          price: Math.round((tutor.hourly_rate || 0) * duration / 60),
          is_paid: true,
          status: "confirmed",
          institution_id: user?.data?.institution_id,
        }).then(() => {
          toast({ title: "Session booked!", description: `${tutor.tutor_name} will see your booking.` });
          qc.invalidateQueries({ queryKey: ["tutorBookings"] });
          window.history.replaceState({}, "", "/tutor-hub");
        }).catch(() => {
          toast({ title: "Booking failed", variant: "destructive" });
        });
      }).catch(() => {});
    }
  }, [user, qc, toast]);

  const filtered = useMemo(() => {
    let arr = tutors || [];
    if (filter === "Verified") arr = arr.filter((t) => t.is_verified);
    else if (filter === "Lecturers") arr = arr.filter((t) => t.role === "lecturer");
    else if (filter === "Teaching Assistants") arr = arr.filter((t) => t.role === "ta");
    else if (filter === "Free") arr = arr.filter((t) => t.is_free);
    else if (filter === "Top Rated") arr = arr.filter((t) => t.rating >= 4.5);

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((t) =>
        t.tutor_name?.toLowerCase().includes(q) ||
        (t.subjects || []).some((s) => s.toLowerCase().includes(q)) ||
        (t.course_codes || []).some((c) => c.toLowerCase().includes(q)) ||
        t.department?.toLowerCase().includes(q) ||
        (t.bio || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [tutors, filter, search]);

  const myProfile = (tutors || []).find((t) => t.tutor_id === user?.id);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="font-bold text-[28px] text-foreground tracking-tight">Tutor Hub</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Book sessions with verified tutors</p>
        </div>
        <button
          onClick={() => setComposerOpen(true)}
          className="w-9 h-9 rounded-full grid place-items-center spring-tap bg-primary text-primary-foreground ice-glow"
          aria-label={myProfile ? "Edit tutor profile" : "Become a tutor"}
        >
          {myProfile ? <GraduationCap className="w-[18px] h-[18px]" /> : <Plus className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject, course, or name..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/30 border border-border/30 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 spring-tap"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap spring-tap ${filter === f ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground border border-border/20"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bud Recommendations */}
      {!isLoading && (tutors || []).length > 0 && (
        <BudTutorRecommendations user={user} tutors={tutors} onOpen={setSelectedTutor} />
      )}

      {/* Stats bar */}
      {(tutors || []).length > 0 && (
        <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-success" /> {(tutors || []).filter((t) => t.is_verified).length} verified</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-warning" /> {(tutors || []).filter((t) => t.rating >= 4.5).length} top rated</span>
          <span>{(tutors || []).filter((t) => t.is_free).length} free</span>
        </div>
      )}

      {/* Tutor Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 rounded-[18px] shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No tutors found"
          description="Try a different search or be the first to offer tutoring."
          action={
            <button onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
              <Plus className="w-3.5 h-3.5" /> Become a Tutor
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map((tutor, i) => (
            <TutorCard key={tutor.id} tutor={tutor} index={i} onOpen={setSelectedTutor} />
          ))}
        </div>
      )}

      {/* Sheets */}
      <AnimatePresence>
        {selectedTutor && (
          <TutorDetailSheet
            tutor={selectedTutor}
            user={user}
            onBook={(t) => { setSelectedTutor(null); setBookingTutor(t); }}
            onClose={() => setSelectedTutor(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bookingTutor && (
          <BookingSheet tutor={bookingTutor} user={user} onClose={() => setBookingTutor(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {composerOpen && (
          <TutorProfileComposer user={user} existing={myProfile} onClose={() => setComposerOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}