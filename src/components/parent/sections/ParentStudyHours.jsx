import React from "react";

export default function ParentStudyHours({ data }) {
  const hours = Math.round((data.studyMinutes || 0) / 60);
  const mins = (data.studyMinutes || 0) % 60;
  return (
    <div className="space-y-4 max-w-[640px]">
      <div className="glass-card radius-lg p-5">
        <p className="text-[12px] uppercase tracking-wider text-muted-foreground">Total study time</p>
        <p className="text-[32px] font-heading font-bold">{hours}<span className="text-[16px] text-muted-foreground font-body font-normal">h {mins}m</span></p>
        <p className="text-[13px] text-muted-foreground mt-1">Across {data.studySessions || 0} logged study sessions.</p>
      </div>
    </div>
  );
}