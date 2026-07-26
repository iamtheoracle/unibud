import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sun, Sunrise, Sunset, Droplets, Wind, Thermometer, Gauge,
  Cloud, CloudSun, Cloudy, CloudFog, CloudRain, CloudDrizzle, CloudSnow,
  CloudLightning, Umbrella, GlassWater, ShieldAlert, CalendarClock, Footprints,
  Sparkles, AlertTriangle, Eye,
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

const EASE = [0.16, 1, 0.3, 1];

const SCENE_ICON = {
  clear: Sun, partly: CloudSun, cloudy: Cloudy, fog: CloudFog,
  rain: CloudRain, drizzle: CloudDrizzle, heavy_rain: CloudRain,
  snow: CloudSnow, thunderstorm: CloudLightning,
};

const SUGGESTION_ICON = {
  Umbrella, GlassWater, ShieldAlert, CalendarClock, Sun, Footprints,
};

const MOOD = {
  clear: "A bright day to be on campus.",
  partly: "A comfortable mix — nice for the walk between halls.",
  cloudy: "Grey skies, but the day is still yours.",
  fog: "Foggy out — leave a little earlier for class.",
  rain: "Rain's about — an umbrella day.",
  heavy_rain: "Heavy rain — indoor study spots are your friend.",
  drizzle: "Light drizzle. A light jacket will do.",
  snow: "Snow — wrap up warm on your way in.",
  thunderstorm: "Storms brewing — stay safe and stay indoors.",
};

const HERO_BG = {
  clear: "from-sky-400 via-sky-300 to-amber-200",
  partly: "from-sky-400 via-sky-300 to-slate-300",
  cloudy: "from-slate-400 via-slate-300 to-slate-200",
  fog: "from-slate-300 via-slate-200 to-slate-100",
  rain: "from-slate-500 via-slate-400 to-sky-500",
  drizzle: "from-sky-500 via-sky-400 to-slate-400",
  heavy_rain: "from-slate-700 via-slate-600 to-slate-500",
  snow: "from-slate-200 via-blue-100 to-white",
  thunderstorm: "from-slate-800 via-slate-700 to-indigo-700",
};

const DARK_SCENES = ["clear-night", "heavy_rain", "thunderstorm"];

function uvLabel(uv) {
  const v = Number(uv) || 0;
  if (v < 3) return "Low";
  if (v < 6) return "Moderate";
  if (v < 8) return "High";
  if (v < 11) return "Very High";
  return "Extreme";
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function WeatherScene({ scene, isDay }) {
  const clouds = [0, 1, 2];
  const drops = Array.from({ length: 12 });
  const flakes = Array.from({ length: 10 });
  const stars = Array.from({ length: 16 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {scene === "clear" && isDay && (
        <div className="absolute left-1/2 top-5 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 wx-sun ice-glow" />
      )}
      {scene === "clear" && !isDay && stars.map((_, i) => (
        <span key={i} className="wx-twinkle absolute rounded-full bg-white" style={{ width: 2.5, height: 2.5, left: `${(i * 37) % 100}%`, top: `${(i * 19) % 55}%`, animationDelay: `${(i % 5) * 0.3}s` }} />
      ))}
      {["partly", "cloudy", "rain", "drizzle", "heavy_rain", "snow", "thunderstorm", "fog"].includes(scene) && clouds.map((i) => (
        <div key={i} className="wx-cloud absolute rounded-full bg-white/70" style={{ width: 100, height: 32, top: `${8 + i * 15}%`, left: "-25%", animationDuration: `${20 + i * 5}s`, animationDelay: `${i * 3}s`, opacity: scene === "cloudy" || scene === "heavy_rain" || scene === "thunderstorm" ? 0.9 : 0.55 }} />
      ))}
      {["rain", "drizzle", "heavy_rain", "thunderstorm"].includes(scene) && drops.map((_, i) => (
        <span key={i} className="wx-rain absolute w-[2px] h-3 rounded-full bg-blue-200/80" style={{ left: `${(i * 13 + 5) % 100}%`, top: "42%", animationDuration: "0.7s", animationDelay: `${(i % 6) * 0.12}s` }} />
      ))}
      {scene === "snow" && flakes.map((_, i) => (
        <span key={i} className="wx-snow absolute rounded-full bg-white" style={{ width: 5, height: 5, left: `${(i * 17 + 3) % 100}%`, top: "32%", animationDuration: "2.4s", animationDelay: `${(i % 6) * 0.3}s` }} />
      ))}
      {scene === "thunderstorm" && <span className="wx-flash absolute inset-0 bg-white/40" />}
    </div>
  );
}

export default function Weather() {
  const navigate = useNavigate();
  const { data: w, isLoading, isError } = useWeather();

  if (isLoading) {
    return (
      <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
        <div className="h-64 rounded-[28px] shimmer" />
      </div>
    );
  }
  if (isError || !w) {
    return (
      <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
        <Link to="/home" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground mb-3 spring-tap"><ArrowLeft className="w-4 h-4" /> Home</Link>
        <div className="glass-card p-8 text-center">
          <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center mx-auto mb-3"><CloudRain className="w-7 h-7 text-muted-foreground" /></div>
          <p className="text-[14px] font-semibold text-foreground">Weather unavailable</p>
          <p className="text-[12px] text-muted-foreground mt-1">Enable location access to see live campus weather.</p>
        </div>
      </div>
    );
  }

  const scene = w.scene || "clear";
  const isDay = w.is_day;
  const cur = w.current || {};
  const today = w.today || {};
  const dark = !isDay || scene === "heavy_rain" || scene === "thunderstorm";
  const textCls = dark ? "text-white" : "text-white";
  const heroBg = HERO_BG[scene] || HERO_BG.clear;

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground mb-3 spring-tap">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
        className={`relative overflow-hidden rounded-[28px] elevated-shadow bg-gradient-to-br ${heroBg}`}>
        <WeatherScene scene={scene} isDay={isDay} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="relative p-6 pt-5">
          <div className="flex items-center gap-1.5 text-white/85">
            <span className="text-[12px] font-medium">{w.location?.name}{w.location?.country ? ", " + w.location.country : ""}</span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className={`font-heading font-extrabold leading-none ${textCls}`} style={{ fontSize: 64 }}>{cur.temp}°</p>
              <p className={`text-[14px] font-semibold mt-1 ${textCls}`}>{cur.condition}</p>
            </div>
            <div className="text-right text-white/85">
              <p className="text-[11px]">H {today.temp_max}° / L {today.temp_min}°</p>
              <p className="text-[11px] mt-0.5">Feels {cur.feels_like}°</p>
            </div>
          </div>
          <p className={`text-[12px] mt-3 ${textCls} opacity-95`}>{MOOD[scene] || "Have a good one on campus."}</p>
        </div>
      </motion.div>

      {/* Alerts */}
      {(w.alerts || []).length > 0 && (
        <div className="mt-4 space-y-2">
          {w.alerts.map((a) => (
            <div key={a.id} className="glass-card p-3.5 flex items-start gap-3" style={{ borderColor: a.severity === "severe" ? "hsl(var(--destructive) / 0.4)" : a.severity === "warning" ? "hsl(var(--warning) / 0.4)" : "hsl(var(--information) / 0.4)" }}>
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: a.severity === "severe" ? "hsl(var(--destructive) / 0.14)" : a.severity === "warning" ? "hsl(var(--warning) / 0.14)" : "hsl(var(--information) / 0.14)" }}>
                <AlertTriangle className="w-4 h-4" style={{ color: a.severity === "severe" ? "hsl(var(--destructive))" : a.severity === "warning" ? "hsl(var(--warning))" : "hsl(var(--information))" }} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground">{a.title}</p>
                <p className="text-[11px] text-muted-foreground">{a.message}</p>
                {a.suggestion && <p className="text-[11px] text-muted-foreground mt-1">{a.suggestion}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metric grid */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Metric icon={Thermometer} label="Feels like" value={`${cur.feels_like}°`} />
        <Metric icon={Droplets} label="Humidity" value={`${cur.humidity}%`} />
        <Metric icon={CloudRain} label="Rain now" value={`${cur.rain_prob}%`} />
        <Metric icon={Wind} label="Wind" value={`${cur.wind} km/h`} />
        <Metric icon={Sun} label="UV" value={`${cur.uv}`} sub={uvLabel(cur.uv)} />
        <Metric icon={Cloud} label="Cloud" value={`${cur.cloud_cover}%`} />
        <Metric icon={Gauge} label="Pressure" value={`${cur.pressure}`} sub="hPa" />
        <Metric icon={Sunrise} label="Sunrise" value={fmtTime(today.sunrise)} />
        <Metric icon={Sunset} label="Sunset" value={fmtTime(today.sunset)} />
      </div>

      {/* Hourly */}
      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-foreground mb-2.5">Next 12 hours</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {(w.hourly || []).slice(0, 12).map((h, i) => {
            const SIcon = SCENE_ICON[h.scene] || Sun;
            return (
              <div key={i} className="flex-shrink-0 w-[58px] rounded-[16px] glass-card p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground">{new Date(h.time).toLocaleTimeString([], { hour: "numeric" })}</p>
                <SIcon className="w-4 h-4 text-primary mx-auto my-1.5" />
                <p className="text-[12px] font-semibold text-foreground">{h.temp}°</p>
                <p className="text-[9px] text-information">{h.precip_prob}%</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weekly */}
      <section className="mt-5">
        <h2 className="text-[13px] font-semibold text-foreground mb-2.5">7-day forecast</h2>
        <div className="glass-card p-2">
          {(w.daily || []).map((d, i) => {
            const SIcon = SCENE_ICON[d.scene] || Sun;
            return (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <p className="text-[12px] font-semibold text-foreground w-10">{i === 0 ? "Today" : new Date(d.date).toLocaleDateString([], { weekday: "short" })}</p>
                <SIcon className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground flex-1 truncate">{d.condition}</p>
                <Droplets className="w-3 h-3 text-information" />
                <p className="text-[11px] text-information w-8">{d.precip_prob}%</p>
                <p className="text-[12px] font-semibold text-foreground w-16 text-right">{d.temp_max}° / {d.temp_min}°</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Suggestions */}
      {(w.suggestions || []).length > 0 && (
        <section className="mt-5">
          <div className="flex items-center gap-1.5 mb-2.5"><Sparkles className="w-3.5 h-3.5 text-primary" /><h2 className="text-[13px] font-semibold text-foreground">For today</h2></div>
          <div className="space-y-2">
            {w.suggestions.map((s) => {
              const SIcon = SUGGESTION_ICON[s.icon] || Sparkles;
              return (
                <div key={s.id} className="glass-card p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0"><SIcon className="w-4 h-4 text-primary" /></div>
                  <div><p className="text-[12px] font-semibold text-foreground">{s.title}</p><p className="text-[11px] text-muted-foreground">{s.body}</p></div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, sub }) {
  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <p className="font-heading font-bold text-[16px] text-foreground leading-none">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}