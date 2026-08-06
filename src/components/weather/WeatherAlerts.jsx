import React from "react";
import { AlertTriangle, Umbrella, GlassWater, ShieldAlert, CalendarClock, Sun, Footprints } from "lucide-react";

const SUG_ICON = { Umbrella, GlassWater, ShieldAlert, CalendarClock, Sun, Footprints };

export default function WeatherAlerts({ alerts = [], suggestions = [] }) {
  if (!alerts.length && !suggestions.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div key={a.id} className={`flex gap-2 rounded-xl p-2.5 border ${a.severity === "severe" ? "bg-red-500/25 border-red-300/40" : a.severity === "warning" ? "bg-amber-500/25 border-amber-300/40" : "bg-sky-500/25 border-sky-300/40"}`}>
          <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${a.severity === "info" ? "text-sky-200" : "text-white"}`} />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white">{a.title}</p>
            <p className="text-[10px] text-white/80">{a.message}</p>
            <p className="text-[10px] text-white/70 mt-0.5">{a.suggestion}</p>
          </div>
        </div>
      ))}
      {suggestions.map((s) => {
        const Icon = SUG_ICON[s.icon] || Sun;
        return (
          <div key={s.id} className="flex gap-2 rounded-xl p-2.5 bg-white/10">
            <Icon className="w-4 h-4 shrink-0 text-sky-200" />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white">{s.title}</p>
              <p className="text-[10px] text-white/70">{s.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}