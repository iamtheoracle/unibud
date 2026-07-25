import React from "react";
import { Empty } from "@/components/lecturer/ui";

export default function ParentAssignments({ data }) {
  const list = data.assignments || [];
  return (
    <div className="space-y-4 max-w-[820px]">
      <p className="text-[13px] text-muted-foreground">Assignments set for {data.student?.full_name || "your student"}.</p>
      {list.length === 0 ? <Empty label="No assignments." /> :
        <div className="space-y-2">{list.map((a) => (
          <div key={a.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{a.title}</p><p className="text-[12px] text-muted-foreground capitalize">{a.type} · {a.course_code || "—"} · due {a.due_date || "—"}</p></div>
            <span className="text-[12px] font-semibold text-muted-foreground capitalize">{a.status}</span>
          </div>
        ))}</div>}
    </div>
  );
}