import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Calendar, Plus } from "lucide-react";
import CommunityShell from "@/components/community/CommunityShell";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import EmptyState from "@/components/ui/EmptyState";
import EventCard from "@/components/campus/EventCard";
import EventDetailSheet from "@/components/events/EventDetailSheet";
import BudEventRecommendations from "@/components/events/BudEventRecommendations";
import WeatherStrip from "@/components/weather/WeatherStrip";
import EventComposer from "@/components/events/EventComposer";
import { EVENT_TYPES, getIcon } from "@/components/campus/campusConstants";

const DEMO_EVENTS = [
  {
    id: "de1", title: "Tech Career Fair 2026", type: "career_fair", date: "2026-07-15",
    start_time: "09:00", end_time: "16:00", location: "Main Auditorium",
    organizer_name: "Career Services", organizer_type: "university",
    attendees_count: 320, is_featured: true, accent_color: "217 91% 60%",
    description: "Meet top employers across tech, finance, and engineering. Bring your CV!",
    banner_url: "https://images.unsplash.com/photo-1633580122864-aa4680ef2887?w=600&q=80",
    capacity: 500, is_free: true, status: "upcoming",
  },
  {
    id: "de2", title: "Inter-Faculty Hackathon", type: "hackathon", date: "2026-07-18",
    start_time: "08:00", end_time: "18:00", location: "Engineering Lab 3",
    organizer_name: "Programming Club", organizer_type: "club",
    attendees_count: 85, is_featured: true, accent_color: "262 83% 58%",
    description: "48 hours of coding, prizes, and innovation. Form teams of 4.",
    banner_url: "https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=600&q=80",
    capacity: 120, is_free: true, status: "upcoming",
  },
  {
    id: "de3", title: "Convocation Ceremony", type: "convocation", date: "2026-07-25",
    start_time: "10:00", end_time: "13:00", location: "Convocation Arena",
    organizer_name: "University", organizer_type: "university",
    attendees_count: 1200, accent_color: "262 83% 58%",
    description: "Graduation ceremony for the 2026 class.",
    banner_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
    capacity: 2000, is_free: true, status: "upcoming",
  },
  {
    id: "de4", title: "Guest Lecture: AI in Healthcare", type: "guest_lecture", date: "2026-07-12",
    start_time: "14:00", end_time: "16:00", location: "LT 1, Faculty of Science",
    organizer_name: "Computer Science Dept", organizer_type: "department",
    attendees_count: 150, accent_color: "217 91% 60%",
    description: "Dr. Sarah Johnson from MIT discusses AI applications in medical diagnosis.",
    capacity: 200, is_free: true, status: "upcoming",
  },
  {
    id: "de5", title: "Cultural Day Celebration", type: "cultural", date: "2026-07-20",
    start_time: "11:00", end_time: "18:00", location: "Student Centre",
    organizer_name: "Student Union", organizer_type: "sug",
    attendees_count: 400, accent_color: "0 72% 51%",
    description: "Celebrate diversity with food, music, and performances from across Nigeria.",
    banner_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
    capacity: 1000, is_free: true, status: "upcoming",
  },
  {
    id: "de6", title: "Research Conference 2026", type: "research_conference", date: "2026-07-30",
    start_time: "09:00", end_time: "17:00", location: "Faculty of Engineering",
    organizer_name: "Research Committee", organizer_type: "university",
    attendees_count: 75, accent_color: "142 71% 45%",
    description: "Annual showcase of student and faculty research projects.",
    capacity: 150, is_free: true, status: "upcoming",
  },
];

const FILTER_KEYS = ["all", ...Object.keys(EVENT_TYPES)];

export default function CampusEvents() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showPast, setShowPast] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showComposer, setShowComposer] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["campusEvents", user?.university],
    queryFn: () => base44.entities.CampusEvent.filter(
      { university: user?.university || "" },
      "-date",
      50
    ),
    enabled: !isDemoMode && !!user,
  });

  const displayEvents = isDemoMode ? DEMO_EVENTS : (events || []);
  const activeUser = isDemoMode ? null : user;

  useEffect(() => {
    if (isDemoMode || !user?.id) return;
    const urlParams = new URLSearchParams(window.location.search);
    const checkinId = urlParams.get("checkin");
    const purchasedId = urlParams.get("purchased");
    if (checkinId) {
      base44.entities.CampusEvent.get(checkinId).then((event) => {
        const checkedIn = event.checked_in || [];
        if (!checkedIn.includes(user.id)) {
          base44.entities.CampusEvent.update(checkinId, { checked_in: [...checkedIn, user.id] });
          toast({ title: "Checked in!", description: event.title });
          qc.invalidateQueries({ queryKey: ["campusEvents"] });
        }
        window.history.replaceState({}, "", "/events");
      }).catch(() => {});
    }
    if (purchasedId) {
      base44.entities.CampusEvent.get(purchasedId).then((event) => {
        const rsvpList = event.rsvp_list || [];
        if (!rsvpList.some((r) => r.user_id === user.id)) {
          base44.entities.CampusEvent.update(purchasedId, {
            rsvp_list: [...rsvpList, { user_id: user.id, name: user.full_name, status: "going", rsvp_at: new Date().toISOString() }],
            attendees_count: (event.attendees_count || 0) + 1,
          });
          toast({ title: "Ticket purchased!", description: "You're going. See you there!" });
          qc.invalidateQueries({ queryKey: ["campusEvents"] });
        }
        window.history.replaceState({}, "", "/events");
      }).catch(() => {});
    }
  }, [user, qc, toast, isDemoMode]);

  const filtered = useMemo(() => {
    const now = new Date();
    return displayEvents.filter((e) => {
      const eventDate = new Date(e.date);
      const isPast = eventDate < now;
      if (showPast !== isPast) return false;
      const matchesFilter = filter === "all" || e.type === filter;
      const matchesSearch = !search ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [displayEvents, filter, search, showPast]);

  const handleAddToCalendar = async (event) => {
    if (!event) return;
    hapticTap();
    toast({ title: `Adding "${event.title}" to calendar...` });
    try {
      await base44.entities.CalendarEvent.create({
        title: event.title,
        description: event.description || "",
        type: "event",
        date: event.date,
        start_time: event.start_time || "",
        end_time: event.end_time || "",
        location: event.location || "",
        source_entity: "CampusEvent",
        source_id: event.id,
      });
      qc.invalidateQueries({ queryKey: ["calendarEvents"] });
      toast({ title: "Added to your calendar" });
    } catch {
      toast({ title: "Failed to add to calendar", variant: "destructive" });
    }
  };

  return (
    <CommunityShell title="Events" icon={Calendar} accent="217 91% 60%" actions={<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ice-glow" aria-hidden><Calendar className="w-5 h-5 text-primary-foreground" /></div>}>

      {/* Search */}
      <div className="py-3 space-y-3">
        {activeUser && (
          <button
            onClick={() => setShowComposer(true)}
            className="w-full h-11 rounded-[16px] bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
        </div>
      </div>

      {/* Weather */}
      <div className="mb-3">
        <WeatherStrip />
      </div>

      {/* Upcoming / Past Toggle */}
      <div className="mb-3">
        <div className="bg-muted/50 rounded-[14px] p-1 flex">
          <button
            onClick={() => setShowPast(false)}
            className={"flex-1 py-2 rounded-[11px] text-[11px] font-semibold transition-all spring-tap " + (!showPast ? "bg-card text-foreground soft-shadow" : "text-muted-foreground")}
          >
            Upcoming
          </button>
          <button
            onClick={() => setShowPast(true)}
            className={"flex-1 py-2 rounded-[11px] text-[11px] font-semibold transition-all spring-tap " + (showPast ? "bg-card text-foreground soft-shadow" : "text-muted-foreground")}
          >
            Past
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="pb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {FILTER_KEYS.map((key) => {
            const meta = key === "all" ? { label: "All" } : EVENT_TYPES[key];
            const Icon = key === "all" ? null : getIcon(meta.icon);
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={
                  "px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap flex items-center gap-1.5 " +
                  (filter === key
                    ? "bg-foreground text-background soft-shadow"
                    : "bg-card text-muted-foreground border border-border/40")
                }
              >
                {Icon && <Icon className="w-3 h-3" />}
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bud Recommendations */}
      {!isDemoMode && (
        <BudEventRecommendations user={activeUser} onOpenEvent={setSelectedEvent} />
      )}

      {/* Events Grid */}
      <div className="responsive-cards">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden">
              <div className="h-24 shimmer" />
              <div className="p-3.5 space-y-2">
                <div className="h-3 w-2/3 shimmer rounded-full" />
                <div className="h-2 w-1/2 shimmer rounded-full" />
                <div className="h-8 shimmer rounded-full" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Calendar}
              title={showPast ? "No past events" : "No upcoming events"}
              description={showPast ? "Past events will appear here." : "Check back soon for new campus events."}
            />
          </div>
        ) : (
          filtered.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              user={activeUser}
              index={i}
              onAddToCalendar={handleAddToCalendar}
              onOpen={setSelectedEvent}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventDetailSheet
            event={selectedEvent}
            user={activeUser}
            onClose={() => setSelectedEvent(null)}
            onAddToCalendar={handleAddToCalendar}
            onShare={() => {
              if (navigator.share) {
                navigator.share({ title: selectedEvent.title, url: `${window.location.origin}/events` });
              } else {
                navigator.clipboard?.writeText(`${window.location.origin}/events`);
                toast({ title: "Link copied" });
              }
            }}
          />
        )}
      </AnimatePresence>
      <EventComposer
        open={showComposer}
        onClose={() => setShowComposer(false)}
        user={activeUser}
        event={null}
      />
    </CommunityShell>
  );
}
