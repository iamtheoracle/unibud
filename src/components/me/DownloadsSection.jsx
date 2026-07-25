import React from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/me/SectionHeader";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) {
    toast({ title: "Nothing to export yet" });
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast({ title: "Export ready" });
}

/**
 * DownloadsSection — export available data as CSV. Modules not yet
 * built surface a gentle "coming soon".
 */
export default function DownloadsSection({ courses, assignments, grades, sessions }) {
  const items = [
    {
      label: "Assignments",
      run: () =>
        downloadCSV("assignments.csv", (assignments || []).map((a) => ({ title: a.title, course: a.course_code, status: a.status, due: (a.due_date || "").split("T")[0] }))),
    },
    {
      label: "Courses",
      run: () =>
        downloadCSV("courses.csv", (courses || []).map((c) => ({ code: c.code, title: c.title, credits: c.credits, status: c.status, grade: c.grade }))),
    },
    {
      label: "Grades",
      run: () =>
        downloadCSV("grades.csv", (grades || []).map((g) => ({ course: g.course_code, type: g.assessment_type, score: g.score, max: g.max_score, date: g.date }))),
    },
    {
      label: "Study Report",
      run: () =>
        downloadCSV("study-report.csv", (sessions || []).map((s) => ({ date: s.session_date, subject: s.subject, duration_min: s.duration_minutes, productivity: s.productivity_score }))),
    },
    { label: "Notes", run: () => toast({ title: "Coming soon", description: "Notes export arrives with the Notes module." }) },
    { label: "Flashcards", run: () => toast({ title: "Coming soon", description: "Flashcards export arrives with the Flashcards module." }) },
    { label: "Summaries", run: () => toast({ title: "Coming soon", description: "Summaries export arrives with the Summaries module." }) },
    { label: "Practice Questions", run: () => toast({ title: "Coming soon", description: "Practice Questions export arrives with that module." }) },
    { label: "Certificates", run: () => toast({ title: "Coming soon", description: "Certificates export arrives with the Certificates module." }) },
  ];

  return (
    <div>
      <SectionHeader title="Downloads" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
        <p className="text-[12px] text-muted-foreground mb-3">Export your data as a CSV file.</p>
        <div className="grid grid-cols-3 gap-3">
          {items.map((it) => (
            <button key={it.label} onClick={it.run} className="p-3 rounded-2xl glass spring-tap card-hover text-center min-h-[60px] flex items-center justify-center">
              <span className="text-[12px] font-semibold text-foreground leading-tight">{it.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}