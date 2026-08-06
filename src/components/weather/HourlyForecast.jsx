import React from "react";

export default function HourlyForecast({ hourly = [] }) {
  if (!hourly.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {hourly.map((h, i) => {
        const t = new Date(h.time);
        const label = i === 0 ? "Now" : t.toLocaleTimeString([], { hour: "numeric" });
        return (
          <div key={i} className="shrink-0 w-12 text-center">
            <p className="text-[10px] text-white/70">{label}</p>
            <p className="text-[15px] font-heading font-bold text-white my-0.5">{h.temp}°</p>
            <p className="text-[9px] text-sky-200/80">{h.precip_prob}%</p>
          </div>
        );
      })}
    </div>
  );
}