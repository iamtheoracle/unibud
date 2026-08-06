import React from "react";

export default function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="font-heading font-bold text-[16px] text-foreground">{title}</h2>
      {action}
    </div>
  );
}