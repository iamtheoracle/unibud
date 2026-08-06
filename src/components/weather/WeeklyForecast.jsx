import React from "react";
import { Droplets } from "lucide-react";

export default function WeeklyForecast({ daily = [] }) {
  if (!daily.length) return null;
  const gMin = Math.min(...daily.map((d) => d.temp_min));
  const gMax = Math.max(...daily.map((d) => d.temp_max));
  const span = gMax - gMin || 1;
  return (
    <div className="space-y-1.5">
      {daily.map((d, i) => {
        const dt = new Date(d.date + "T00:00:00");
        const day = i === 0 ? "Today" : dt.toLocaleDateString([], { weekday: "short" });
        const left = ((d.temp_min - gMin) / span) * 100;
        const width = Math.max(((d.temp_max - d.temp_min) / span) * 100, 8);
        return (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="w-10 text-white/70 font-medium">{day}</span>
            <span className="w-7 text-sky-200/70 flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" />{d.precip_prob}%</span>
            <span className="w-7 text-right text-white/60">{d.temp_min}°</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/15 relative overflow-hidden">
              <div className="absolute h-full rounded-full bg-gradient-to-r from-sky-300 to-amber-300" style={{ left: `${left}%`, width: `${width}%` }} />
            </div>
            <span className="w-7 text-white font-semibold">{d.temp_max}°</span>
          </div>
        );
      })}
    </div>
  );
}