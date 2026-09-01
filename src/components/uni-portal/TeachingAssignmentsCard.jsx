import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { BookOpen, ChevronRight } from "lucide-react";
import { UniCard } from "@/components/uni-portal/UniPortalUI";
import UniEmptyState from "@/components/uni-portal/UniEmptyState";

export default function TeachingAssignmentsCard({ user, delay = 0.1 }) {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useQuery({
    queryKey: ["Course", "lecturer", "active"],
    queryFn: () => base44.entities.Course.list("-created_date", 50),
  });

  const active = (courses || []).filter((c) => c.status === "active");

  return (
    <UniCard
      title="Teaching Assignments"
      description="Active courses this semester"
      delay={delay}
      className="lg:col-span-2"
      padding={false}
    >
      {isLoading ? (
        <div className="p-5 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-[12px] bg-muted/40 shimmer" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <UniEmptyState
          icon={BookOpen}
          title="No teaching assignments yet"
          description="Your active courses will appear here once assigned."
          actionLabel="Manage Courses"
          onAction={() => navigate("/uni-portal/courses")}
          accent="primary"
        />
      ) : (
        <div className="divide-y divide-border/20">
          {active.slice(0, 6).map((c, i) => (
            <motion.div
              key={c.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 cursor-pointer"
              onClick={() => navigate("/uni-portal/courses")}
            >
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{c.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {c.code}
                  {c.department ? ` · ${c.department}` : ""}
                  {c.credits ? ` · ${c.credits} credits` : ""}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          ))}
        </div>
      )}
    </UniCard>
  );
}