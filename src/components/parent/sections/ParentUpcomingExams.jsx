import React from "react";
import { Empty } from "@/components/lecturer/ui";

export default function ParentUpcomingExams({ data }) {
  const list = (data.exams || []).filter((e) => e.status === "upcoming");
  return (
    <div className="space-y-4 max-w-[820px]">
      <p className="text-[13px] text-muted-foreground">Upcoming exams for {data.student?.full_name || "your student"}.</p>
      {list.length === 0 ? <Empty label="No upcoming exams." /> :
        <div className="space-y-2">{list.map((e) => (
          <div key={e.id} className="glass-card radius-lg p-3">
            <p className="font-semibold text-[14px]">{e.title}</p>
            <p className="text-[12px] text-muted-foreground capitalize">{e.type} · {e.course_code} · {e.date} · {e.start_time || ""}{e.location ? ` · ${e.location}` : ""}</p>
          </div>
        ))}</div>}
    </div>
  );
}