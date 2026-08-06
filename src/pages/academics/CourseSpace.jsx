import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, FileText, Users, LayoutDashboard, Calendar,
  MapPin, GraduationCap, Clock, BadgeCheck, Plus, Share2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fallbackIfEmpty } from "@/lib/mock/useMockFallback";
import { getMockCourseById, ASSIGNMENT_MOCK_ENTRIES, ATTENDANCE_RECORD_MOCK_ENTRIES } from "@/lib/academic/mockShapes";
import { NOTE_MOCK_ENTRIES } from "@/lib/academic/mockShapes2";
import { UNIBUD_STUDENTS } from "@/lib/mock/contentRegistry";
import EmptyState from "@/components/academics/EmptyState";
import QRShareSheet from "@/components/shared/QRShareSheet";
import { timeAgo } from "@/components/quad/quadConstants";
import CourseContent from "@/components/academics/CourseContent";

const EASE = [0.16, 1, 0.3, 1];
const normCode = (s) => (s || "").replace(/\s+/g, "").toUpperCase();

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "content", label: "Content", icon: BookOpen },
  { key: "materials", label: "My Notes", icon: FileText },
  { key: "assignments", label: "Assignments", icon: FileText },
  { key: "classmates", label: "Classmates", icon: Users },
];

function statusColor(s) {
  return ({
    pending: "bg-muted-foreground/15 text-muted-foreground",
    in_progress: "bg-information/15 text-information",
    submitted: "bg-accent/15 text-accent",
    graded: "bg-success/15 text-success",
    late: "bg-warning/15 text-warning",
  })[s] || "bg-muted-foreground/15 text-muted-foreground";
}

/**
 * CourseSpace — each course becomes its own collaborative space.
 * Aggregates the student's notes, assignments, attendance and discovers
 * classmates taking the same course, so learning feels connected.
 */
export default function CourseSpace() {
  const { courseId } = useParams();
  const [tab, setTab] = useState("overview");
  const [shareOpen, setShareOpen] = useState(false);
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const courseQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => base44.entities.Course.get(courseId),
    enabled: !!courseId,
    retry: false,
    staleTime: 60_000,
  });
  const course = courseQuery.data || getMockCourseById(courseId);
  const isLoading = courseQuery.isLoading && !course;

  const code = course?.code;

  const notesQuery = useQuery({
    queryKey: ["courseNotes", code],
    queryFn: () => base44.entities.Note.filter({ course_code: code }, "-created_date", 50),
    enabled: !!code,
  });
  const notes = fallbackIfEmpty(notesQuery.data, NOTE_MOCK_ENTRIES.filter((n) => normCode(n.course_code) === normCode(code)));

  const assignmentsQuery = useQuery({
    queryKey: ["courseAssignments", code],
    queryFn: () => base44.entities.Assignment.filter({ course_code: code }, "-created_date", 50),
    enabled: !!code,
  });
  const assignments = fallbackIfEmpty(assignmentsQuery.data, ASSIGNMENT_MOCK_ENTRIES.filter((a) => normCode(a.course_code) === normCode(code)));

  const attendanceQuery = useQuery({
    queryKey: ["courseAttendance", code],
    queryFn: () => base44.entities.AttendanceRecord.filter({ course_code: code }, "-created_date", 100),
    enabled: !!code,
  });
  const attendance = fallbackIfEmpty(attendanceQuery.data, ATTENDANCE_RECORD_MOCK_ENTRIES.filter((a) => normCode(a.course_code) === normCode(code)));

  const classmatesQuery = useQuery({
    queryKey: ["courseClassmates", code],
    queryFn: async () => {
      const res = await base44.functions.invoke("studentSearch", { action: "search", query: code, pageSize: 30 });
      const list = res?.data?.results || res?.results || [];
      return list.filter((r) => (r.course_code || "").toLowerCase().includes((code || "").toLowerCase()));
    },
    enabled: !!code,
  });
  const classmates = fallbackIfEmpty(
    classmatesQuery.data,
    UNIBUD_STUDENTS.slice(0, 6).map((s) => ({ id: s.id, full_name: s.full_name, avatar_url: s.avatar_url, department: s.department, level: s.level, is_verified: s.is_verified }))
  );
  const matesLoading = classmatesQuery.isLoading;

  const attPct = useMemo(() => {
    const recs = attendance || [];
    if (!recs.length) return null;
    const present = recs.filter((a) => a.status === "present" || a.status === "excused").length;
    return Math.round((present / recs.length) * 100);
  }, [attendance]);

  if (isLoading) {
    return <div className="w-full max-w-[600px] mx-auto px-5 pt-8 safe-area-pt"><div className="h-40 rounded-[24px] glass-card shimmer" /></div>;
  }
  if (!course) {
    return (
      <div className="w-full max-w-[600px] mx-auto px-5 pt-8 safe-area-pt">
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground mb-3 spring-tap">
          <ArrowLeft className="w-4 h-4" /> My Courses
        </Link>
        <EmptyState message="This course space isn't available." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground mb-3 spring-tap">
        <ArrowLeft className="w-4 h-4" /> My Courses
      </Link>

      {/* Course header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="glass-card p-5 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: (course.color || "#7FD8FF") + "22" }}>
            <BookOpen className="w-5 h-5" style={{ color: course.color || "#0B1F4D" }} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-extrabold text-[20px] text-foreground leading-tight">{course.title}</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">{course.code}{course.lecturer ? ` · ${course.lecturer}` : ""}</p>
          </div>
          <button onClick={() => setShareOpen(true)} className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center spring-tap shrink-0" aria-label="Share course">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] text-muted-foreground">
          {course.faculty && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {course.faculty}</span>}
          {course.department && <span>{course.department}</span>}
          {course.semester && <span>{course.semester}</span>}
          {course.schedule && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.schedule}</span>}
          {course.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {course.location}</span>}
          {course.credits != null && <span>{course.credits} credits</span>}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat label="Progress" value={`${Math.round(course.progress || 0)}%`} />
          <Stat label="Grade" value={course.grade || "—"} />
          <Stat label="Attendance" value={attPct != null ? `${attPct}%` : "—"} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 p-1 rounded-[16px] bg-muted/40">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[12px] text-[12px] font-semibold transition-colors spring-tap ${active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <Overview course={course} notes={notes || []} assignments={assignments || []} attPct={attPct} />}
      {tab === "content" && <CourseContent course={course} user={user} />}
      {tab === "materials" && <Materials notes={notes || []} code={code} />}
      {tab === "assignments" && <Assignments list={assignments || []} code={code} />}
      {tab === "classmates" && <Classmates list={classmates || []} loading={matesLoading} />}

      <QRShareSheet open={shareOpen} onClose={() => setShareOpen(false)} to={`/course/${courseId}`} title={course.title} subtitle={course.code} />
    </div>
  );
}

function Stat({ label, value }) {
  return (<div className="p-2.5 rounded-[14px] bg-muted/40 text-center"><p className="font-heading font-bold text-[15px] text-foreground">{value}</p><p className="text-[9px] text-muted-foreground mt-0.5">{label}</p></div>);
}

function Overview({ course, notes, assignments, attPct }) {
  const pending = assignments.filter((a) => a.status === "pending" || a.status === "in_progress");
  return (
    <div className="space-y-4">
      {course.description && (
        <div className="glass-card p-4">
          <p className="text-[11px] font-semibold text-muted-foreground mb-1">About this course</p>
          <p className="text-[13px] text-foreground leading-relaxed">{course.description}</p>
        </div>
      )}
      <div className="glass-card p-4">
        <p className="text-[11px] font-semibold text-muted-foreground mb-2">Up next</p>
        {pending.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">Nothing pending — you're on track.</p>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 3).map((a) => (
              <Link key={a.id} to="/assignments" className="flex items-center gap-2 text-[13px] spring-tap">
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate flex-1 text-foreground">{a.title}</span>
                {a.due_date && <span className="text-[10px] text-muted-foreground">{timeAgo(a.due_date)}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="glass-card p-4">
        <p className="text-[11px] font-semibold text-muted-foreground mb-2">Recent materials</p>
        {notes.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No notes saved for this course yet.</p>
        ) : (
          <div className="space-y-2">
            {notes.slice(0, 3).map((n) => (
              <Link key={n.id} to="/notes" className="flex items-center gap-2 text-[13px] spring-tap">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate flex-1 text-foreground">{n.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Materials({ notes, code }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold text-muted-foreground">{notes.length} note{notes.length === 1 ? "" : "s"}</p>
        <Link to="/notes" className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary spring-tap"><Plus className="w-3.5 h-3.5" /> Add note</Link>
      </div>
      {notes.length === 0 ? (
        <EmptyState message={`No notes for ${code} yet. Capture your first lecture note.`} />
      ) : (
        <div className="space-y-2.5">
          {notes.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }} className="glass-card p-3.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[13px] font-semibold text-foreground truncate flex-1">{n.title}</p>
              </div>
              {n.summary && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{n.summary}</p>}
              <p className="text-[10px] text-muted-foreground mt-1.5">{timeAgo(n.created_date)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Assignments({ list, code }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold text-muted-foreground">{list.length} assignment{list.length === 1 ? "" : "s"}</p>
        <Link to="/assignments" className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary spring-tap"><Plus className="w-3.5 h-3.5" /> Add</Link>
      </div>
      {list.length === 0 ? (
        <EmptyState message={`No assignments for ${code} yet.`} />
      ) : (
        <div className="space-y-2.5">
          {list.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }} className="glass-card p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-foreground truncate">{a.title}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(a.status)}`}>{(a.status || "pending").replace("_", " ")}</span>
              </div>
              {a.due_date && <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due {new Date(a.due_date).toLocaleDateString()}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Classmates({ list, loading }) {
  if (loading) return <div className="h-24 rounded-[20px] glass-card shimmer" />;
  if (list.length === 0) {
    return <EmptyState message="No classmates found yet — they'll appear here as more students join this course." />;
  }
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] text-muted-foreground px-1">{list.length} student{list.length === 1 ? "" : "s"} taking this course</p>
      {list.map((c, i) => (
        <motion.div key={c.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }} className="flex items-center gap-3 glass-card p-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[14px] shrink-0 overflow-hidden">
            {c.avatar_url ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : (c.full_name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="text-[13px] font-semibold text-foreground truncate">{c.full_name || "Student"}</p>
              {c.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{[c.department, c.level].filter(Boolean).join(" · ")}</p>
          </div>
          <Link to="/connect" className="text-[11px] font-semibold text-primary spring-tap">Connect</Link>
        </motion.div>
      ))}
    </div>
  );
}