import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, CloudRain, CloudSun } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

function getGreeting(hour) {
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function getWeatherIcon(condition) {
  if (!condition) return CloudSun;
  const c = condition.toLowerCase();
  if (c.includes("rain")) return CloudRain;
  if (c.includes("cloud")) return CloudSun;
  if (c.includes("sun") || c.includes("clear")) return Sun;
  if (c.includes("night")) return Moon;
  return CloudSun;
}

/**
 * HeroGreeting — personalized animated greeting for the Bud Home hero.
 *
 * Shows:
 *  - Time-based greeting ("Good morning", "Good afternoon", etc.)
 *  - User's name
 *  - Current time (updates live)
 *  - Optional weather condition + temperature
 *  - University branding
 *
 * Props:
 *  - userName: string
 *  - university: string
 *  - weather: { condition, temperature }
 *  - className: extra
 */
export default function HeroGreeting({ userName, university, weather, className = "" }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const greeting = getGreeting(now.getHours());
  const WeatherIcon = getWeatherIcon(weather?.condition);
  const timeStr = now.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className={cn("", className)}>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
        className="text-[12px] font-semibold text-white/50 uppercase tracking-wider"
      >
        {greeting}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
        className="font-heading font-extrabold text-[24px] text-white leading-tight tracking-tight drop-shadow-lg"
      >
        {userName ? `Hey, ${userName.split(" ")[0]}` : "Welcome back"}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
        className="flex items-center gap-3 mt-2"
      >
        <span className="text-[12px] text-white/60 font-medium">{dateStr}</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span className="text-[12px] text-white/60 font-medium tabular-nums">{timeStr}</span>
        {weather && (
          <>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <WeatherIcon className="w-3.5 h-3.5 text-white/50" strokeWidth={2} />
              </motion.span>
              {weather.temperature != null && (
                <span className="text-[12px] text-white/60 font-medium tabular-nums">
                  {weather.temperature}°
                </span>
              )}
            </div>
          </>
        )}
      </motion.div>

      {university && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: EASE }}
          className="flex items-center gap-1.5 mt-2"
        >
          <div className="px-2 py-0.5 rounded-full glass-strong">
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{university}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}