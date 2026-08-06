import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, ClipboardList, FlaskConical, Award, Megaphone,
  MessageSquare, ChevronRight, Users, TrendingUp,
} from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

/* ── Module wrapper ── */
function ModuleShell({ icon: Icon, title, to, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={2} />
          <h3 className="text-[14px] font-bold text-foreground tracking-tight">{title}</h3>
        </div>
        {to && (
          <Link to={to} className="flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground spring-tap hover:text-foreground transition-colors">
            See all <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

/* ── Today's Academic Summary ── */
export function AcademicSummary({ nextClass, nextDeadline, gpa, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="glass-strong rounded-[24px] p-5"
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Next Class</p>
          {loading ? (
            <div className="h-5 rounded shimmer" />
          ) : (
            <>
              <p className="text-[16px] font-bold text-foreground truncate">{nextClass?.code || "Free"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{nextClass?.start || "No classes"}</p>
            </>
          )}
        </div>
        <div className="text-center border-l border-r border-border">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Due Soon</p>
          {loading ? (
            <div className="h-5 rounded shimmer" />
          ) : (
            <>
              <p className="text-[16px] font-bold text-foreground truncate">{nextDeadline?.title || "None"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{nextDeadline?.dueIn || "All clear"}</p>
            </>
          )}
        </div>
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">GPA</p>
          {loading ? (
            <div className="h-5 rounded shimmer" />
          ) : (
            <>
              <p className="text-[16px] font-bold text-foreground">{gpa || "—"}</p>
              <p className="text-[11px] text-muted-foreground">Current</p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Upcoming Classes ── */
export function UpcomingClasses({ classes, loading }) {
  return (
    <ModuleShell icon={Clock} title="Upcoming Classes" to="/timetable">
      <div className="glass rounded-[20px] divide-y divide-border/50">
        {loading ? (
          [0, 1, 2].map((i) => <div key={i} className="p-4"><div className="h-5 rounded shimmer" /></div>)
        ) : classes && classes.length > 0 ? (
          classes.slice(0, 4).map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <p className="text-[13px] font-semibold text-foreground tabular-nums w-14 shrink-0">{c.start}</p>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-foreground truncate">{c.code}</p>
                <p className="text-[12px] text-muted-foreground truncate">{c.title} · {c.room}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4">
            <p className="text-[14px] text-muted-foreground">No classes today — great for deep work.</p>
          </div>
        )}
      </div>
    </ModuleShell>
  );
}

/* ── Assignments Due ── */
const DEMO_ASSIGNMENTS = [
  { title: "Data Structures Lab 3", course: "CSC 301", due: "Tomorrow", priority: "high" },
  { title: "Quantum Problem Set", course: "PHY 203", due: "3 days", priority: "medium" },
  { title: "Research Proposal Draft", course: "CSC 499", due: "5 days", priority: "medium" },
  { title: "Lab Report 4", course: "BIO 201", due: "1 week", priority: "low" },
];

export function AssignmentsDue({ loading }) {
  return (
    <ModuleShell icon={ClipboardList} title="Assignments Due" to="/assignments">
      <div className="glass rounded-[20px] divide-y divide-border/50">
        {loading ? (
          [0, 1].map((i) => <div key={i} className="p-4"><div className="h-5 rounded shimmer" /></div>)
        ) : (
          DEMO_ASSIGNMENTS.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-4 spring-tap hover:bg-white/[0.03] transition-colors">
              <div className={`w-1 h-10 rounded-full ${a.priority === "high" ? "bg-red-500" : a.priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-foreground truncate">{a.title}</p>
                <p className="text-[12px] text-muted-foreground">{a.course}</p>
              </div>
              <span className="text-[12px] font-semibold text-muted-foreground">{a.due}</span>
            </div>
          ))
        )}
      </div>
    </ModuleShell>
  );
}

/* ── Department Announcements ── */
const DEMO_ANNOUNCEMENTS = [
  { author: "Dr. Adeyemi", role: "CS Department", content: "CSC 301 assignment deadline extended to Friday. Submit via the portal.", time: "2h ago", replies: 12 },
  { author: "Physics Dept", role: "Faculty Notice", content: "PHY 203 tutorial moved to Lab 3 this Friday at 3PM. All students welcome.", time: "4h ago", replies: 8 },
  { author: "Student Union", role: "University", content: "Annual General Meeting next Tuesday. All department representatives must attend.", time: "6h ago", replies: 24 },
];

export function DepartmentAnnouncements() {
  return (
    <ModuleShell icon={Megaphone} title="Announcements" to="/communication">
      <div className="space-y-3">
        {DEMO_ANNOUNCEMENTS.map((a, i) => (
          <div key={i} className="glass rounded-[20px] p-4 spring-tap hover:shadow-premium transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-foreground/8 grid place-items-center text-[12px] font-bold text-foreground">
                {a.author.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-foreground truncate">{a.author}</p>
                <p className="text-[11px] text-muted-foreground">{a.role} · {a.time}</p>
              </div>
            </div>
            <p className="text-[14px] text-foreground/90 leading-relaxed">{a.content}</p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
              <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground spring-tap hover:text-foreground transition-colors">
                <MessageSquare className="w-[14px] h-[14px]" strokeWidth={1.8} /> {a.replies}
              </button>
              <button className="text-[12px] text-muted-foreground spring-tap hover:text-foreground transition-colors">Reply</button>
              <button className="text-[12px] text-muted-foreground spring-tap hover:text-foreground transition-colors ml-auto">Save</button>
            </div>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}

/* ── Research Opportunities ── */
const DEMO_RESEARCH = [
  { title: "AI Research Assistant", pi: "Dr. Okafor", area: "Machine Learning", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&q=80" },
  { title: "Climate Data Analysis", pi: "Dr. Bello", area: "Environmental Science", img: "https://images.unsplash.com/photo-1569163139599-0f4514e2100a?w=300&q=80" },
  { title: "Robotics Lab Position", pi: "Dr. Chen", area: "Mechatronics", img: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=300&q=80" },
];

export function ResearchOpportunities() {
  return (
    <ModuleShell icon={FlaskConical} title="Research Opportunities" to="/research">
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {DEMO_RESEARCH.map((r, i) => (
          <Link key={i} to="/research" className="glass rounded-[20px] overflow-hidden w-[220px] shrink-0 spring-tap hover:shadow-premium transition-shadow">
            <div className="h-24">
              <Image src={r.img} alt={r.title} fittingType="fill" className="w-full h-full" />
            </div>
            <div className="p-3">
              <p className="text-[14px] font-semibold text-foreground leading-tight">{r.title}</p>
              <p className="text-[12px] text-muted-foreground mt-1">{r.pi}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-foreground/8 text-[10px] font-medium text-muted-foreground">{r.area}</span>
            </div>
          </Link>
        ))}
      </div>
    </ModuleShell>
  );
}

/* ── Scholarships ── */
const DEMO_SCHOLARSHIPS = [
  { title: "Merit Excellence Award", amount: "₦500,000", deadline: "Sep 15" },
  { title: "STEM Innovation Grant", amount: "₦750,000", deadline: "Oct 1" },
  { title: "Future Leaders Fund", amount: "₦1,000,000", deadline: "Oct 30" },
];

export function CampusScholarships() {
  return (
    <ModuleShell icon={Award} title="Scholarships" to="/scholarships">
      <div className="glass rounded-[20px] divide-y divide-border/50">
        {DEMO_SCHOLARSHIPS.map((s, i) => (
          <Link key={i} to="/scholarships" className="flex items-center gap-3 p-4 spring-tap hover:bg-white/[0.03] transition-colors">
            <div className="w-10 h-10 rounded-[12px] bg-foreground/8 grid place-items-center">
              <Award className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground truncate">{s.title}</p>
              <p className="text-[12px] text-muted-foreground">Deadline: {s.deadline}</p>
            </div>
            <span className="text-[15px] font-bold text-foreground">{s.amount}</span>
          </Link>
        ))}
      </div>
    </ModuleShell>
  );
}

/* ── Course Discussions ── */
const DEMO_DISCUSSIONS = [
  { course: "CSC 301", topic: "Assignment 3 — Question 2 approach?", replies: 18, active: 4, time: "12m ago" },
  { course: "PHY 203", topic: "Best resources for quantum mechanics?", replies: 12, active: 2, time: "1h ago" },
  { course: "MTH 201", topic: "Linear Algebra study group forming", replies: 24, active: 7, time: "2h ago" },
];

export function CourseDiscussions() {
  return (
    <ModuleShell icon={MessageSquare} title="Course Discussions" to="/courses">
      <div className="glass rounded-[20px] divide-y divide-border/50">
        {DEMO_DISCUSSIONS.map((d, i) => (
          <div key={i} className="p-4 spring-tap hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-foreground/8 text-[10px] font-bold text-foreground">{d.course}</span>
              <span className="text-[11px] text-muted-foreground ml-auto">{d.time}</span>
            </div>
            <p className="text-[14px] font-medium text-foreground leading-snug">{d.topic}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MessageSquare className="w-[12px] h-[12px]" strokeWidth={1.8} /> {d.replies} replies
              </span>
              <span className="flex items-center gap-1 text-[11px] text-green-500">
                <Users className="w-[12px] h-[12px]" strokeWidth={1.8} /> {d.active} active
              </span>
            </div>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}

/* ── Department Highlights ── */
const DEMO_HIGHLIGHTS = [
  { dept: "Computer Science", news: "New AI Lab opens next month with 30 GPU workstations", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80" },
  { dept: "Physics", news: "Student paper accepted to Nature Physics journal", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&q=80" },
  { dept: "Mathematics", news: "Math Olympiad team qualifies for nationals", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&q=80" },
];

export function DepartmentHighlights() {
  return (
    <ModuleShell icon={TrendingUp} title="Department Highlights" to="/research">
      <div className="space-y-3">
        {DEMO_HIGHLIGHTS.map((h, i) => (
          <div key={i} className="glass rounded-[20px] overflow-hidden spring-tap hover:shadow-premium transition-shadow">
            <div className="flex gap-3 p-3">
              <div className="w-16 h-16 rounded-[14px] overflow-hidden shrink-0">
                <Image src={h.img} alt={h.dept} fittingType="fill" className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h.dept}</span>
                <p className="text-[13px] font-medium text-foreground leading-snug mt-0.5">{h.news}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}