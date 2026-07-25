import React from "react";
import { Empty } from "@/components/lecturer/ui";

export default function ParentNotices({ data }) {
  const list = data.notices || [];
  return (
    <div className="space-y-4 max-w-[820px]">
      <p className="text-[13px] text-muted-foreground">Institution notices visible to {data.student?.full_name || "your student"}.</p>
      {list.length === 0 ? <Empty label="No notices." /> :
        <div className="space-y-2">{list.map((n) => (
          <div key={n.id} className="glass-card radius-lg p-3">
            <p className="font-semibold text-[14px]">{n.title}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{n.message}</p>
            <p className="text-[11px] text-muted-foreground mt-1 capitalize">{n.audience?.replace(/_/g, " ")} · {n.priority}</p>
          </div>
        ))}</div>}
    </div>
  );
}