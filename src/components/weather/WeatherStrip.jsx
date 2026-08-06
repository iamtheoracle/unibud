import React from "react";
import { MapPin, Droplets } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import WeatherScene from "./WeatherScene";

export default function WeatherStrip({ className = "" }) {
  const { data: w } = useWeather();
  if (!w) return null;
  return (
    <div className={`relative overflow-hidden rounded-2xl elevated-shadow ${className}`}>
      <WeatherScene scene={w.scene} isDay={w.is_day} />
      <div className="relative flex items-center gap-3 px-3.5 py-2.5">
        <span className="font-heading font-extrabold text-[22px] text-white leading-none">{w.current.temp}°</span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-white truncate">{w.current.condition}</p>
          <p className="text-[10px] text-white/70 flex items-center gap-1 truncate">
            <MapPin className="w-2.5 h-2.5 shrink-0" />{w.location.name} · <Droplets className="w-2.5 h-2.5 shrink-0" />{w.current.rain_prob}%
          </p>
        </div>
      </div>
    </div>
  );
}