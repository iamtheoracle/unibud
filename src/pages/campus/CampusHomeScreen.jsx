import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarDays, BookOpen, Radio, ChevronRight, Sun, Moon,
  Sparkles, TrendingUp, ArrowRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { Image } from "@/components/ui/image";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun };
  if (hour < 17) return { text: "Good afternoon", icon: Sun };
  if (hour < 21) return { text: "Good evening", icon: Moon };
  return { text: "Good night", icon: Moon };
}

/**
 * CampusHomeScreen — production-ready campus dashboard.
 * Connects to real entities: CampusEvent, Assignment, Course, LiveStream.
 * Supports loading, empty, error, offline states with pull-to-refresh.
 *
 * Props:
 *  - user: current user object from auth
 *  - onNavigate: (path) => void
 */
export default function CampusHomeScreen({ user, onNavigate }) {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [greeting] = useState(getGreeting());
  const GreetingIcon = greeting.icon;

  // Fetch live streams
  const {
    data: liveStreams,
    isLoading: liveLoading,
    isError: liveError,
    refetch: refetchLive,
  } = useQuery({
    queryKey: ["campus", "live"],
    queryFn: () => base44.entities.LiveStream.filter({ status: "live" }, "-created_date", 10),
    enabled: isOnline,
  });

  // Fetch upcoming events
  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ["campus", "events"],
    queryFn: () => base44.entities.CampusEvent.list("-date", 5),
    enabled: isOnline,
  });

  // Fetch assignments
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ["campus", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 5),
    enabled: isOnline,
  });

  // Fetch courses
  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ["campus", "courses"],
    queryFn: () => base44.entities.Course.list("-created_date", 4),
    enabled: isOnline,
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["campus"] }),
    ]);
  }, [queryClient]);

  const handleRetry = useCallback(() => {
    refetchLive();
    refetchEvents();
    refetchAssignments();
    refetchCourses();
  }, [refetchLive, refetchEvents, refetchAssignments, refetchCourses]);

  // Determine overall state
  const allLoading = liveLoading && eventsLoading && assignmentsLoading && coursesLoading;
  const anyError = (liveError || eventsError || assignmentsError || coursesError) && !allLoading;
  const state = !isOnline ? "offline" : allLoading ? "loading" : anyError ? "error" : "ready";

  return (
    <ProductionState
      state={state}
      onRetry={handleRetry}
      onRefresh={handleRefresh}
      skeleton={<HomeSkeleton />}
      error="We couldn't load your campus data. Please try again."
    >
      <div className="px-4 py-5 space-y-5 max-w-[600px] mx-auto pb-24">
        {/* Greeting */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <GreetingIcon className="w-5 h-5 text-primary" strokeWidth={2} />
            <p className="text-[13px] text-muted-foreground font-medium">{greeting.text},</p>
          </div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight">
            {user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student"}
          </h1>
        </div>

        {/* Bud proactive suggestion */}
        <BudSuggestion
          assignments={assignments || []}
          liveStreams={liveStreams || []}
          events={events || []}
          onNavigate={onNavigate}
        />

        {/* Live Now */}
        {(liveStreams?.length ?? 0) > 0 && (
          <Section title="Live Now" onSeeAll={() => onNavigate?.("/live")}>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4">
              {liveStreams.slice(0, 5).map((stream) => (
                <LiveStreamCard key={stream.id} stream={stream} onClick={() => onNavigate?.(`/live/${stream.id}`)} />
              ))}
            </div>
          </Section>
        )}

        {/* Quick actions grid */}
        <div className="grid grid-cols-4 gap-2">
          <QuickAction icon={CalendarDays} label="Timetable" onClick={() => onNavigate?.("/timetable")} />
          <QuickAction icon={BookOpen} label="Courses" onClick={() => onNavigate?.("/courses")} />
          <QuickAction icon={TrendingUp} label="Grades" onClick={() => onNavigate?.("/academics/results")} />
          <QuickAction icon={Radio} label="Live" onClick={() => onNavigate?.("/live")} />
        </div>

        {/* Assignments due */}
        <Section title="Assignments" onSeeAll={() => onNavigate?.("/assignments")}>
          {(assignments?.length ?? 0) === 0 ? (
            <EmptyRow icon={BookOpen} text="No assignments due" />
          ) : (
            <div className="space-y-2">
              {assignments.slice(0, 3).map((item) => (
                <AssignmentRow key={item.id} assignment={item} onClick={() => onNavigate?.("/assignments")} />
              ))}
            </div>
          )}
        </Section>

        {/* Courses */}
        <Section title="My Courses" onSeeAll={() => onNavigate?.("/courses")}>
          {(courses?.length ?? 0) === 0 ? (
            <EmptyRow icon={BookOpen} text="No courses enrolled yet" />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {courses.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} onClick={() => onNavigate?.(`/course/${course.id}`)} />
              ))}
            </div>
          )}
        </Section>

        {/* Upcoming events */}
        <Section title="Campus Events" onSeeAll={() => onNavigate?.("/events")}>
          {(events?.length ?? 0) === 0 ? (
            <EmptyRow icon={CalendarDays} text="No upcoming events" />
          ) : (
            <div className="space-y-2">
              {events.slice(0, 3).map((event) => (
                <EventRow key={event.id} event={event} onClick={() => onNavigate?.("/events")} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </ProductionState>
  );
}

function BudSuggestion({ assignments, liveStreams, events, onNavigate }) {
  const message =
    assignments.length > 0
      ? `You have ${assignments.length} assignment${assignments.length > 1 ? "s" : ""} due. Want me to help prioritize?`
      : liveStreams.length > 0
      ? `${liveStreams.length} live session${liveStreams.length > 1 ? "s" : ""} happening now on campus.`
      : events.length > 0
      ? `${events.length} upcoming event${events.length > 1 ? "s" : ""} this week. Tap to see details.`
      : "Your day looks clear. Perfect time to get ahead on your studies.";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onNavigate?.("/bud")}
      className="w-full p-3.5 rounded-[20px] bg-card shadow-sm flex items-center gap-3 text-left"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
      >
        <Sparkles className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Bud</p>
        <p className="text-[12px] text-foreground mt-0.5 leading-snug">{message}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function Section({ title, onSeeAll, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-[15px] font-bold text-foreground tracking-tight">{title}</h3>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-[11px] font-bold text-primary active:scale-95 transition-transform">
            See all
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-2 rounded-[16px] bg-card shadow-sm"
    >
      <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
      </div>
      <span className="text-[10px] font-semibold text-foreground">{label}</span>
    </motion.button>
  );
}

function LiveStreamCard({ stream, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 w-40 rounded-[18px] overflow-hidden bg-card shadow-sm text-left"
    >
      <div className="relative h-24 bg-muted">
        {stream.thumbnail_url ? (
          <Image src={stream.thumbnail_url} alt={stream.title} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-chocolate" />
        )}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-destructive flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[8px] font-bold text-white uppercase tracking-wider">Live</span>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-bold text-foreground line-clamp-1">{stream.title}</p>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          {stream.viewer_count || 0} watching
        </p>
      </div>
    </motion.button>
  );
}

function AssignmentRow({ assignment, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-4 h-4 text-primary" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground truncate">{assignment.title}</p>
        <p className="text-[10px] text-muted-foreground">
          {assignment.course_code || assignment.subject || "General"}
        </p>
      </div>
      {assignment.due_date && (
        <span className="text-[10px] font-bold text-primary px-2 py-1 rounded-full bg-primary/10 flex-shrink-0">
          {formatDate(assignment.due_date)}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function CourseCard({ course, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-8 h-8 rounded-[10px] bg-chocolate/10 flex items-center justify-center mb-2">
        <BookOpen className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
      </div>
      <p className="text-[12px] font-bold text-foreground truncate">{course.code || course.name}</p>
      <p className="text-[9px] text-muted-foreground truncate mt-0.5">{course.name || course.title}</p>
    </motion.button>
  );
}

function EventRow({ event, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-10 h-10 rounded-[12px] bg-chocolate flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-[8px] font-bold text-white/70 uppercase">{formatMonth(event.date)}</span>
        <span className="text-[14px] font-bold text-white">{formatDay(event.date)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground truncate">{event.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {event.location || event.start_time || "Campus"}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function EmptyRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6 rounded-[16px] bg-card shadow-sm">
      <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
      <p className="text-[12px] text-muted-foreground">{text}</p>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonth(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short" });
}

function formatDay(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).getDate().toString();
}

function HomeSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="h-3 w-28 rounded-full bg-muted animate-pulse" />
        <div className="h-7 w-40 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="h-16 rounded-[20px] bg-card shadow-sm animate-pulse" />
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-[16px] bg-card shadow-sm animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-[16px] bg-card shadow-sm animate-pulse" />
        ))}
      </div>
    </div>
  );
}