import React from "react";
import { useNavigate } from "react-router-dom";
import { Award } from "lucide-react";

const STATS = [
  { label: "CGPA", value: "4.32", to: "/academics/results" },
  { label: "Attendance", value: "92%", to: "/attendance" },
  { label: "Credits", value: "78", to: "/academics" },
  { label: "Standing", value: "Good", to: "/academics", status: true },
];
const COURSES = [
  { code: "CSC401", title: "Artificial Intelligence", lecturer: "Dr. Bello" },
  { code: "CSC403", title: "Software Engineering", lecturer: "Dr. Adebayo" },
  { code: "CSC405", title: "Database Systems", lecturer: "Prof. Okafor" },
  { code: "MTH301", title: "Linear Algebra", lecturer: "Dr. Eze" },
];
const TIMETABLE = [
  { day: "Mon", time: "9:00", course: "CSC401", loc: "LT2" },
  { day: "Mon", time: "11:00", course: "CSC403", loc: "LT3" },
  { day: "Wed", time: "10:00", course: "CSC405", loc: "Lab 4" },
  { day: "Fri", time: "9:00", course: "MTH301", loc: "LT1" },
];
const PROJECTS = [
  { title: "AI Study Companion", desc: "AI-powered study tool" },
  { title: "Campus Navigation App", desc: "Indoor navigation for UNILAG" },
];
const CERTS = [
  { name: "AI Ethics Certificate", issuer: "AI Club", date: "2025" },
  { name: "Software Engineering Internship", issuer: "Google DSC", date: "2024" },
];
const ORGS = [
  { name: "AI Club", role: "Lead" },
  { name: "Google Developer Student Club", role: "Member" },
  { name: "IEEE Computer Society", role: "Student Member" },
];
const ACHIEVEMENTS = [
  { title: "Dean's List", year: "2024/2025" },
  { title: "Hackathon Winner", year: "2025" },
  { title: "Top Contributor", year: "2024" },
];

function Section({ title, onMore, children }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">{title}</span>
        {onMore && <button onClick={onMore} className="text-[11px] text-primary spring-tap">More</button>}
      </div>
      {children}
    </div>
  );
}

/** MeAcademic — academic profile snapshot. Real identity fields + demo
 * metrics, every section linking to its full dedicated route. */
export default function MeAcademic({ user }) {
  const navigate = useNavigate();
  const university = user?.university || "University of Lagos";
  const faculty = user?.faculty || "Faculty of Engineering";
  const department = user?.department || "Computer Science";
  const level = user?.level || "300 Level";

  return (
    <div className="flex flex-col gap-5">
      <Section title="University" onMore={() => navigate("/academics")}>
        <div className="glass-card p-3.5">
          <div className="text-[13px] font-semibold text-foreground">{university}</div>
          <div className="text-[12px] text-muted-foreground">{faculty} · {department}</div>
          <div className="text-[11px] text-muted-foreground/70 mt-0.5">{level}</div>
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-2.5">
        {STATS.map((s) => (
          <button key={s.label} onClick={() => navigate(s.to)} className="text-left p-3 rounded-2xl glass border border-border/40 spring-tap">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{s.label}</div>
            <div className={`text-[18px] font-bold ${s.status ? "text-success" : "text-foreground"}`}>{s.value}</div>
          </button>
        ))}
      </div>

      <Section title="Current Courses" onMore={() => navigate("/courses")}>
        <div className="glass-card p-1">
          {COURSES.map((c) => (
            <button key={c.code} onClick={() => navigate("/courses")} className="w-full flex justify-between items-center py-2 px-2 border-b border-border/20 last:border-0 spring-tap">
              <div className="text-left">
                <div className="text-[13px] font-medium text-foreground">{c.code}</div>
                <div className="text-[11px] text-muted-foreground">{c.title}</div>
              </div>
              <div className="text-[11px] text-muted-foreground/70">{c.lecturer}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Timetable" onMore={() => navigate("/timetable")}>
        <div className="glass-card p-1">
          {TIMETABLE.map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-2 border-b border-border/20 last:border-0">
              <span className="text-[11px] font-semibold text-foreground w-8">{t.day}</span>
              <span className="text-[11px] text-muted-foreground w-10">{t.time}</span>
              <span className="text-[12px] text-foreground flex-1">{t.course}</span>
              <span className="text-[11px] text-muted-foreground/70">{t.loc}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Projects" onMore={() => navigate("/projects")}>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {PROJECTS.map((p) => (
            <div key={p.title} className="flex-shrink-0 w-44 p-3 rounded-2xl glass border border-border/40">
              <div className="text-[12px] font-semibold text-foreground">{p.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Certificates" onMore={() => navigate("/academic-timeline")}>
        <div className="glass-card p-1">
          {CERTS.map((c) => (
            <div key={c.name} className="flex justify-between items-center py-2 px-2 border-b border-border/20 last:border-0">
              <span className="text-[12px] text-foreground">{c.name}</span>
              <span className="text-[11px] text-muted-foreground/70">{c.issuer} · {c.date}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Organizations" onMore={() => navigate("/clubs")}>
        <div className="glass-card p-1">
          {ORGS.map((o) => (
            <div key={o.name} className="flex justify-between items-center py-2 px-2 border-b border-border/20 last:border-0">
              <span className="text-[12px] text-foreground">{o.name}</span>
              <span className="text-[11px] text-muted-foreground/70">{o.role}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Achievements" onMore={() => navigate("/academic-timeline")}>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map((a) => (
            <span key={a.title} className="px-3 py-1.5 rounded-full text-[11px] glass border border-border/40 text-muted-foreground flex items-center gap-1">
              <Award className="w-3 h-3 text-gold" /> {a.title} · {a.year}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}