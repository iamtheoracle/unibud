import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { AlertCircle, FileText } from "lucide-react";
import moment from "moment";

const mockDeadlines = [
  { title: "Data Structures Assignment 3", course: "CSC 301", due: moment().add(1, "day").toISOString(), status: "pending", priority: "high" },
  { title: "Linear Algebra Problem Set", course: "MTH 201", due: moment().add(3, "days").toISOString(), status: "pending", priority: "medium" },
  { title: "Physics Lab Report", course: "PHY 203", due: moment().add(5, "days").toISOString(), status: "pending", priority: "low" },
];

export default function DeadlinesCard() {
  return (
    <div>
      <SectionHeader title="Upcoming Deadlines" subtitle="3 due this week" icon={AlertCircle} action="All" actionLink="/academics" />
      <div className="space-y-2">
        {mockDeadlines.map((d, i) => (
          <GlassCard key={i} variant="solid" className="p-3" delay={0.2 + i * 0.05}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                d.priority === "high" ? "bg-red-50" : d.priority === "medium" ? "bg-amber-50" : "bg-blue-50"
              }`}>
                <FileText className={`w-4 h-4 ${
                  d.priority === "high" ? "text-red-500" : d.priority === "medium" ? "text-amber-500" : "text-blue-500"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[12px] truncate">{d.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{d.course}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className={`text-[10px] font-medium ${
                    moment(d.due).diff(moment(), "days") <= 1 ? "text-red-500" : "text-muted-foreground"
                  }`}>
                    {moment(d.due).fromNow()}
                  </span>
                </div>
              </div>
              <StatusBadge status={d.priority} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}