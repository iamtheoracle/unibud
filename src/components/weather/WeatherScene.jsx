import React from "react";

const GRAD = {
  clear: "from-[#0B1F4D] to-[#1d4ed8]",
  partly: "from-[#0B1F4D] to-[#2563eb]",
  cloudy: "from-[#0B1F4D] to-[#334155]",
  fog: "from-[#1e293b] to-[#475569]",
  drizzle: "from-[#0B1F4D] to-[#1e3a8a]",
  rain: "from-[#0B1F4D] to-[#1e3a8a]",
  heavy_rain: "from-[#020617] to-[#1e3a8a]",
  snow: "from-[#1e293b] to-[#64748b]",
  thunderstorm: "from-[#020617] to-[#312e81]",
};
const NIGHT = "from-[#020617] to-[#0B1F4D]";

export default function WeatherScene({ scene = "clear", isDay = true, className = "" }) {
  const bg = !isDay ? NIGHT : (GRAD[scene] || GRAD.clear);
  const cloudy = ["partly", "cloudy", "fog", "drizzle", "rain", "heavy_rain", "thunderstorm"].includes(scene);
  const rainy = ["drizzle", "rain", "heavy_rain", "thunderstorm"].includes(scene);
  const heavy = scene === "heavy_rain" || scene === "thunderstorm";

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${bg} ${className}`}>
      {(scene === "clear" || scene === "partly") && isDay && (
        <div className="absolute -top-6 -right-4 w-28 h-28 rounded-full bg-yellow-300/80 blur-[2px] wx-sun shadow-[0_0_60px_rgba(253,224,71,0.55)]" />
      )}
      {!isDay && (
        <>
          <div className="absolute top-3 right-5 w-11 h-11 rounded-full bg-slate-100/85 wx-sun shadow-[0_0_30px_rgba(226,232,240,0.4)]" />
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="absolute rounded-full bg-white wx-twinkle" style={{ width: 2, height: 2, top: `${(i * 37) % 80}%`, left: `${(i * 53) % 95}%`, animationDelay: `${(i % 5) * 0.4}s` }} />
          ))}
        </>
      )}
      {cloudy && (
        <>
          <div className="absolute top-3 left-0 w-24 h-8 rounded-full bg-white/20 wx-cloud" style={{ animationDuration: "32s" }} />
          <div className="absolute top-10 left-0 w-32 h-10 rounded-full bg-white/15 wx-cloud" style={{ animationDuration: "46s", animationDelay: "8s" }} />
        </>
      )}
      {scene === "fog" && <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />}
      {rainy && (
        <div className="absolute inset-0">
          {Array.from({ length: heavy ? 30 : 16 }).map((_, i) => (
            <span key={i} className="absolute w-px bg-white/60 wx-rain" style={{ height: 12, top: "-12px", left: `${(i * 13) % 100}%`, animationDuration: `${0.5 + (i % 4) * 0.18}s`, animationDelay: `${(i % 6) * 0.12}s` }} />
          ))}
        </div>
      )}
      {scene === "snow" && (
        <div className="absolute inset-0">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="absolute rounded-full bg-white/80 wx-snow" style={{ width: 4, height: 4, top: "-6px", left: `${(i * 17) % 100}%`, animationDuration: `${2 + (i % 4) * 0.6}s`, animationDelay: `${(i % 5) * 0.5}s` }} />
          ))}
        </div>
      )}
      {scene === "thunderstorm" && <div className="absolute inset-0 bg-white/60 wx-flash" />}
      <div className="absolute inset-0 bg-black/15" />
    </div>
  );
}