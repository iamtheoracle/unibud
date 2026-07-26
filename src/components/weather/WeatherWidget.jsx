import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Droplets, Wind, Sun, Sunrise, Sunset, Thermometer, ChevronDown } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import WeatherScene from "./WeatherScene";
import HourlyForecast from "./HourlyForecast";
import WeeklyForecast from "./WeeklyForecast";
import WeatherAlerts from "./WeatherAlerts";

const EASE = [0.16, 1, 0.3, 1];

function Chip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2 py-1.5">
      <Icon className="w-3.5 h-3.5 text-white/70" />
      <div className="leading-tight">
        <p className="text-[9px] uppercase tracking-wide text-white/60">{label}</p>
        <p className="text-[11px] font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function WeatherWidget() {
  const { data: w, isLoading, isError } = useWeather();
  const [open, setOpen] = useState(false);

  if (isLoading) return <div className="rounded-[28px] h-[150px] shimmer" />;
  if (isError || !w) return (
    <div className="rounded-[28px] p-5 glass-card">
      <p className="text-[13px] font-semibold text-muted-foreground">Weather unavailable</p>
      <p className="text-[11px] text-muted-foreground mt-1">Live weather will appear here when you're online.</p>
    </div>
  );

  const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");

  // Always-visible impact line — the directive requires weather to explain
  // its effect on the student's day, not merely display conditions.
  const impact = w.alerts[0]
    ? { text: w.alerts[0].suggestion || w.alerts[0].title, urgent: w.alerts[0].severity !== "info" }
    : w.suggestions[0]
    ? { text: w.suggestions[0].title, urgent: false }
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="relative overflow-hidden rounded-[28px] elevated-shadow">
      <WeatherScene scene={w.scene} isDay={w.is_day} className="rounded-[28px]" />
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1 text-white/80">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[12px] font-medium">{w.location.name}{w.location.country ? `, ${w.location.country}` : ""}</span>
            </div>
            <p className="text-[12px] text-white/70 mt-0.5">{w.current.condition}</p>
          </div>
          <span className="font-heading font-extrabold text-[42px] text-white leading-none">{w.current.temp}°</span>
        </div>

        {impact && (
          <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 ${impact.urgent ? "bg-amber-500/20 border border-amber-300/30" : "bg-white/10"}`}>
            <span className="text-[11px] font-medium text-white/90 leading-snug">{impact.text}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mt-4">
          <Chip icon={Thermometer} label="Feels" value={`${w.current.feels_like}°`} />
          <Chip icon={Droplets} label="Humidity" value={`${w.current.humidity}%`} />
          <Chip icon={Droplets} label="Rain" value={`${w.current.rain_prob}%`} />
          <Chip icon={Wind} label="Wind" value={`${w.current.wind} km/h`} />
          <Chip icon={Sun} label="UV" value={`${w.current.uv}`} />
          <Chip icon={Sunrise} label="Sunrise" value={fmtTime(w.today.sunrise)} />
          <Chip icon={Sunset} label="Sunset" value={fmtTime(w.today.sunset)} />
        </div>

        {(w.alerts.length > 0 || w.suggestions.length > 0) && (
          <button onClick={() => setOpen((o) => !o)} className="mt-3 w-full flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 spring-tap">
            <span className="text-[12px] font-semibold text-white">{w.alerts.length} alerts · {w.suggestions.length} tips</span>
            <ChevronDown className={`w-4 h-4 text-white transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}

        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="mt-3 space-y-4 overflow-hidden">
            <div><p className="text-[10px] uppercase tracking-wide text-white/60 mb-2">Next 12 hours</p><HourlyForecast hourly={w.hourly} /></div>
            <div><p className="text-[10px] uppercase tracking-wide text-white/60 mb-2">7-day forecast</p><WeeklyForecast daily={w.daily} /></div>
            <WeatherAlerts alerts={w.alerts} suggestions={w.suggestions} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}