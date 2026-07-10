import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CloudSun, Droplets, Wind, MapPin, CloudRain } from "lucide-react";

const WEATHER_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Foggy", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  56: "Freezing drizzle", 57: "Freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Rain showers", 81: "Rain showers", 82: "Heavy showers",
  85: "Snow showers", 86: "Snow showers",
  95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
};

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(true);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (loading) {
        setError(true);
        setLoading(false);
      }
    }, 12000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timeoutId);
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
          );
          const data = await res.json();
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            condition: WEATHER_CODES[data.current.weather_code] || "Clear",
            humidity: data.current.relative_humidity_2m,
            wind: Math.round(data.current.wind_speed_10m),
          });
        } catch {
          setError(true);
        }
        setLoading(false);
      },
      () => {
        clearTimeout(timeoutId);
        setError(true);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[24px] p-5 elevated-shadow h-[140px] shimmer"
      />
    );
  }

  if (error || !weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[24px] p-5 elevated-shadow bg-card border border-border/40"
      >
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
          <p className="text-[13px] font-semibold text-muted-foreground">Weather unavailable</p>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">Enable location access to see local weather</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[24px] p-5 elevated-shadow bg-gradient-to-br from-info to-info/80"
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-4 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <CloudSun className="w-5 h-5 text-white/90" strokeWidth={1.8} />
              <span className="text-white/80 text-[12px] font-medium">{weather.condition}</span>
            </div>
            <p className="text-white/60 text-[11px] mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Current Location
            </p>
          </div>
          <span className="font-heading font-extrabold text-[40px] text-white leading-none">{weather.temp}°</span>
        </div>

        <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-white/15">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-white/70" strokeWidth={1.8} />
            <div>
              <p className="text-white/50 text-[9px] font-medium uppercase tracking-wide">Humidity</p>
              <p className="text-white text-[12px] font-semibold">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-white/70" strokeWidth={1.8} />
            <div>
              <p className="text-white/50 text-[9px] font-medium uppercase tracking-wide">Wind</p>
              <p className="text-white text-[12px] font-semibold">{weather.wind} km/h</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}