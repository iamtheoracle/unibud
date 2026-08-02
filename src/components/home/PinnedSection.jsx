import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList, Users, CalendarDays, Target, FolderKanban, ChevronRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";

export default function PinnedSection() {
  const { data: assignments } = useQuery({
    queryKey: ["home-pinned-assignments"],
    queryFn: () => base44.entities.Assignment.filter({ is_pinned: true }, "-due_date", 3),
    staleTime: 60000,
  });
  const { data: groups } = useQuery({
    queryKey: ["home-pinned-groups"],
    queryFn: () => base44.entities.StudyGroup.filter({ is_pinned: true }, "-created_date", 3),
    staleTime: 60000,
  });
  const { data: events } = useQuery({
    queryKey: ["home-pinned-events"],
    queryFn: () => base44.entities.CampusEvent.filter({ is_pinned: true }, "-created_date", 3),
    staleTime: 60000,
  });
  const { data: goals } = useQuery({
    queryKey: ["home-pinned-goals"],
    queryFn: () => base44.entities.StudentGoal.filter({ is_pinned: true }, "-created_date", 3),
    staleTime: 60000,
  });
  const { data: projects } = useQuery({
    queryKey: ["home-pinned-projects"],
    queryFn: () => base44.entities.Project.filter({ is_pinned: true }, "-created_date", 3),
    staleTime: 60000,
  });

  const pinned = [
    ...((assignments || []).map((a) => ({ id: a.id, type: "Assignment", title: a.title, sub: a.course_code || "", icon: ClipboardList, to: "/assignments" }))),
    ...((groups || []).map((g) => ({ id: g.id, type: "Study Group", title: g.name || g.title || "Group", sub: `${g.member_count || 0} members`, icon: Users, to: `/study-groups/${g.id}` }))),
    ...((events || []).map((e) => ({ id: e.id, type: "Event", title: e.title || e.name || "Event", sub: e.start_date || e.date || "", icon: CalendarDays, to: "/events" }))),
    ...((goals || []).map((g) => ({ id: g.id, type: "Goal", title: g.title || g.name || "Goal", sub: g.category || "", icon: Target, to: "/study/planner" }))),
    ...((projects || []).map((p) => ({ id: p.id, type: "Project", title: p.title || p.name || "Project", sub: p.course_code || "", icon: FolderKanban, to: "/projects" }))),
  ];

  if (pinned.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
      {pinned.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
          >
            <Link
              to={item.to}
              className="block w-[200px] p-4 rounded-[20px] spring-tap hover-lift"
              style={{
                background: "linear-gradient(160deg, rgba(58, 42, 34, 0.7), rgba(44, 33, 26, 0.7))",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-[12px] grid place-items-center" style={{ background: "rgba(255,138,42,0.10)" }}>
                  <Icon className="w-[17px] h-[17px]" strokeWidth={2} style={{ color: ORANGE }} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: CREAM_MUTED }}>{item.type}</span>
              </div>
              <p className="text-[14px] font-semibold leading-tight truncate" style={{ color: CREAM }}>{item.title}</p>
              {item.sub && <p className="text-[12px] mt-0.5 truncate" style={{ color: CREAM_MUTED }}>{item.sub}</p>}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}