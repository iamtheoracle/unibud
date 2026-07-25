import React from "react";
import { Empty } from "@/components/lecturer/ui";

export default function ParentAttendance({ data }) {
  const list = data.attendance || [];
  const present = list.filter((a) => a.status === "present").length;
  const absent = list.filter((a) => a.status === "absent").length;
  const rate = list.length ? Math.round((present / list.length) * 100) : 0;
  return (
    <div className="space-y-4 max-w-[820px]">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Records" value={list.length} />
        <Stat label="Present" value={present} />
        <Stat label="Rate" value={`${rate}%`} />
      </div>
      {list.length === 0 ? <Empty label="No attendance records." /> :
        <div className="space-y-2">{list.map((a) => (
          <div key={a.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1"><p className="font-semibold text-[14px]">{a.course_code}</p><p className="text-[12px] text-muted-foreground">{a.date} · {a.note || ""}</p></div>
            <span className={`text-[12px] font-semibold ${a.status === "present" ? "text-success" : a.status === "absent" ? "text-destructive" : "text-warning"}`}>{a.status}</span>
          </div>
        ))}</div>}
    </div>
  );
}

const Stat = ({ label, value }) => <div className="glass-card radius-lg p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-[20px] font-heading font-bold">{value}</p></div>;