import { useQuery } from "@tanstack/react-query";

// Smart Weather — live data via Open-Meteo (free, CORS-enabled, no API key).
// Geolocation first (browser), else geocode a campus name, else default Lagos.
// Parses current / 12h hourly / 7-day daily and synthesizes alerts + suggestions.

const WMO = {
  0: ["Clear sky", "clear"], 1: ["Mainly clear", "clear"], 2: ["Partly cloudy", "partly"], 3: ["Overcast", "cloudy"],
  45: ["Fog", "fog"], 48: ["Rime fog", "fog"], 51: ["Light drizzle", "drizzle"], 53: ["Drizzle", "drizzle"],
  55: ["Heavy drizzle", "drizzle"], 56: ["Freezing drizzle", "drizzle"], 57: ["Freezing drizzle", "drizzle"],
  61: ["Light rain", "rain"], 63: ["Rain", "rain"], 65: ["Heavy rain", "heavy_rain"], 66: ["Freezing rain", "rain"], 67: ["Freezing rain", "rain"],
  71: ["Light snow", "snow"], 73: ["Snow", "snow"], 75: ["Heavy snow", "snow"], 77: ["Snow grains", "snow"],
  80: ["Rain showers", "rain"], 81: ["Rain showers", "rain"], 82: ["Violent showers", "heavy_rain"],
  85: ["Snow showers", "snow"], 86: ["Snow showers", "snow"],
  95: ["Thunderstorm", "thunderstorm"], 96: ["Thunderstorm w/ hail", "thunderstorm"], 99: ["Thunderstorm w/ hail", "thunderstorm"],
};
const wmo = (c) => { const m = WMO[c] || ["Clear", "clear"]; return { label: m[0], scene: m[1] }; };

function getCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: "Current Location" }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  });
}

async function geocode(name) {
  try {
    const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
    const r = (await g.json()).results?.[0];
    return r ? { lat: r.latitude, lon: r.longitude, name: r.name, country: r.country || "" } : null;
  } catch { return null; }
}

function build(loc, lat, lon, d) {
  const cur = d.current || {};
  const code = cur.weather_code ?? 0;
  const meta = wmo(code);
  const isDay = cur.is_day === 1;
  const times = d.hourly?.time || [];
  const nowIdx = Math.max(0, times.findIndex((t) => new Date(t) >= new Date(Date.now() - 3600000)));
  const curPrecipProb = d.hourly?.precipitation_probability?.[nowIdx] ?? 0;
  const curUv = d.hourly?.uv_index?.[nowIdx] ?? 0;

  const today = {
    sunrise: d.daily?.sunrise?.[0], sunset: d.daily?.sunset?.[0],
    temp_max: Math.round(d.daily?.temperature_2m_max?.[0] ?? 0), temp_min: Math.round(d.daily?.temperature_2m_min?.[0] ?? 0),
    uv_max: d.daily?.uv_index_max?.[0] ?? 0, precip_prob_max: d.daily?.precipitation_probability_max?.[0] ?? 0,
    wind_max: Math.round(d.daily?.wind_speed_10m_max?.[0] ?? 0), condition: wmo(d.daily?.weather_code?.[0] ?? code).label,
  };

  const hourly = [];
  for (let i = nowIdx; i < Math.min(nowIdx + 12, times.length); i++) {
    const hc = wmo(d.hourly?.weather_code?.[i] ?? 0);
    hourly.push({ time: times[i], temp: Math.round(d.hourly?.temperature_2m?.[i] ?? 0), precip_prob: d.hourly?.precipitation_probability?.[i] ?? 0, uv: d.hourly?.uv_index?.[i] ?? 0, condition: hc.label, scene: hc.scene });
  }

  const daily = (d.daily?.time || []).map((date, i) => {
    const dc = wmo(d.daily?.weather_code?.[i] ?? 0);
    return { date, condition: dc.label, scene: dc.scene, temp_max: Math.round(d.daily?.temperature_2m_max?.[i] ?? 0), temp_min: Math.round(d.daily?.temperature_2m_min?.[i] ?? 0), precip_prob: d.daily?.precipitation_probability_max?.[i] ?? 0, uv_max: d.daily?.uv_index_max?.[i] ?? 0, wind_max: Math.round(d.daily?.wind_speed_10m_max?.[i] ?? 0), sunrise: d.daily?.sunrise?.[i], sunset: d.daily?.sunset?.[i] };
  });

  const alerts = [];
  if (meta.scene === "thunderstorm") alerts.push({ id: "storm", severity: "severe", category: "Storm", title: "Thunderstorm warning", message: "Thunderstorms expected in your area.", suggestion: "Stay indoors and avoid open areas. Campus safety notifications are active." });
  if (today.precip_prob_max >= 80) alerts.push({ id: "heavy_rain", severity: "warning", category: "Heavy Rain", title: "Heavy rain likely", message: `${today.precip_prob_max}% rain probability today.`, suggestion: "Reschedule outdoor events. Move outdoor classes indoors." });
  else if (today.precip_prob_max >= 50) alerts.push({ id: "rain", severity: "info", category: "Rain", title: "Rain expected", message: `${today.precip_prob_max}% rain probability today.`, suggestion: "Carry an umbrella. Consider indoor study spaces." });
  if (today.temp_max >= 35) alerts.push({ id: "heat", severity: "severe", category: "Extreme Heat", title: "Extreme heat advisory", message: `High of ${today.temp_max}°C today.`, suggestion: "Stay hydrated. Use cool study locations like the library and air-conditioned rooms." });
  else if (today.temp_max >= 30) alerts.push({ id: "warm", severity: "info", category: "Warm", title: "Warm day ahead", message: `High of ${today.temp_max}°C.`, suggestion: "Keep water handy and take breaks in shaded areas." });
  if (today.uv_max >= 8) alerts.push({ id: "uv", severity: "warning", category: "UV", title: "Extreme UV index", message: `UV peaks at ${today.uv_max} today.`, suggestion: "Apply sunscreen and limit midday sun exposure." });
  if (today.wind_max >= 40) alerts.push({ id: "wind", severity: "warning", category: "Wind", title: "Strong winds", message: `Gusts up to ${today.wind_max} km/h.`, suggestion: "Secure loose items and avoid exposed areas." });

  const suggestions = [];
  if (["rain", "heavy_rain", "drizzle"].includes(meta.scene) || today.precip_prob_max >= 50) suggestions.push({ id: "umbrella", icon: "Umbrella", title: "Carry an umbrella", body: "Rain is in the forecast today." });
  if (today.temp_max >= 35) suggestions.push({ id: "hydrate", icon: "GlassWater", title: "Stay hydrated", body: "Carry water and seek cool, air-conditioned study spaces." });
  if (meta.scene === "thunderstorm") suggestions.push({ id: "safety", icon: "ShieldAlert", title: "Campus safety", body: "Avoid open fields and tall trees during the storm." });
  if (today.precip_prob_max >= 80) suggestions.push({ id: "reschedule", icon: "CalendarClock", title: "Reschedule events", body: "Move outdoor events to another day or indoors." });
  if (today.uv_max >= 8) suggestions.push({ id: "sunscreen", icon: "Sun", title: "Apply sunscreen", body: "UV is very high — protect your skin outdoors." });
  if (!suggestions.length && meta.scene === "clear") suggestions.push({ id: "walk", icon: "Footprints", title: "Great weather", body: "A fine day to walk between classes or study outdoors." });

  return {
    location: { name: loc.name, country: loc.country || "", latitude: lat, longitude: lon, timezone: d.timezone },
    current: { temp: Math.round(cur.temperature_2m ?? 0), feels_like: Math.round(cur.apparent_temperature ?? 0), humidity: cur.relative_humidity_2m ?? 0, rain_prob: curPrecipProb, wind: Math.round(cur.wind_speed_10m ?? 0), wind_dir: cur.wind_direction_10m ?? 0, uv: Math.round(curUv * 10) / 10, is_day: isDay, weather_code: code, condition: meta.label, scene: meta.scene, cloud_cover: cur.cloud_cover ?? 0, pressure: Math.round(cur.pressure_msl ?? 0) },
    today, hourly, daily, alerts, suggestions, scene: meta.scene, is_day: isDay, fetched_at: new Date().toISOString(),
  };
}

export function useWeather() {
  return useQuery({
    queryKey: ["weather"],
    queryFn: async () => {
      let loc = await getCoords();
      if (!loc) loc = (await geocode("Lagos")) || { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 };
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m` +
        `&hourly=temperature_2m,precipitation_probability,weather_code,uv_index` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max,wind_speed_10m_max` +
        `&timezone=auto&forecast_days=7`;
      const r = await fetch(url);
      const d = await r.json();
      return build(loc, loc.lat, loc.lon, d);
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 1,
  });
}