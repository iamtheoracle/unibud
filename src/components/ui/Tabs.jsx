import React from "react";

export default function Tabs({ tabs, activeTab, onChange, className = "" }) {
  return (
    <div className={`flex gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
            activeTab === tab
              ? "bg-foreground text-background"
              : "bg-card text-muted-foreground border border-border/50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}