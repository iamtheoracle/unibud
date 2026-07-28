import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import WeatherScene from "@/components/weather/WeatherScene";

const EASE = [0.16, 1, 0.3, 1];

export default function HomeWeatherCompact() {
  const navigate = useNavigate();
  const { data: w, isLoading, isError } = useWeather();

  if (isLoading) return <div className="rounded-2xl h-14 shimmer" />;

  if (isError || !w) {
    return (
      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} onClick={() => navigate("/weather")} className="w-full glass rounded-2xl p-3 flex items-center gap-2 spring-tap">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-[12px] text-muted-foreground">Weather unavailable</span>
      </motion.button>
    );
  }

  const impact = w.alerts?.[0]?.suggestion || w.alerts?.[0]?.title || w.suggestions?.[0]?.title;

  return (
    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} onClick={() => navigate("/weather")} className="w-full relative overflow-hidden rounded-2xl elevated-shadow spring-tap">
      <div className="absolute inset-0"><WeatherScene scene={w.scene} isDay={w.is_day} className="h-full w-full" /></div>
      <div className="relative flex items-center gap-3 p-3">
        <span className="font-heading font-extrabold text-[26px] text-white leading-none">{w.current.temp}°</span>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[12px] font-semibold text-white truncate">{w.current.condition}</p>
          <p className="text-[10px] text-white/70 truncate flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{w.location.name}</p>
        </div>
        {impact && <p className="hidden sm:block text-[10px] text-white/80 max-w-[140px] text-right line-clamp-2">{impact}</p>}
        <ChevronRight className="w-4 h-4 text-white/70 shrink-0" />
      </div>
    </motion.button>
  );
}