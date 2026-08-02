import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, Building2, Search, X, Layers, Coffee, Dumbbell, FlaskConical, BookOpen, Bus, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";
const EASE = [0.16, 1, 0.3, 1];

// Default campus center (generic university campus)
const CAMPUS_CENTER = [6.5244, 3.3792]; // Lagos coordinates as default

const BUILDINGS = [
  { id: "library", name: "Main Library", category: "academic", icon: BookOpen, coords: [6.5245, 3.3790], floors: 4, desc: "Central library with study spaces, computer labs, and over 50,000 books." },
  { id: "science", name: "Science Block", category: "academic", icon: FlaskConical, coords: [6.5248, 3.3795], floors: 5, desc: "Laboratories and lecture halls for Physics, Chemistry, and Biology departments." },
  { id: "engineering", name: "Engineering Building", category: "academic", icon: Building2, coords: [6.5242, 3.3798], floors: 6, desc: "Engineering faculty with workshops, labs, and design studios." },
  { id: "arts", name: "Arts & Humanities", category: "academic", icon: BookOpen, coords: [6.5249, 3.3788], floors: 4, desc: "Lecture halls and seminar rooms for Arts, Languages, and Philosophy." },
  { id: "cafeteria", name: "Student Cafeteria", category: "amenity", icon: Coffee, coords: [6.5246, 3.3794], floors: 2, desc: "Main dining hall with multiple food vendors and seating for 500 students." },
  { id: "sports", name: "Sports Complex", category: "amenity", icon: Dumbbell, coords: [6.5241, 3.3790], floors: 2, desc: "Indoor courts, gymnasium, and fitness center open to all students." },
  { id: "bus-stop", name: "Shuttle Terminal", category: "transport", icon: Bus, coords: [6.5250, 3.3793], floors: 1, desc: "Main shuttle terminal with routes across campus and to town." },
  { id: "security", name: "Security Post", category: "safety", icon: Shield, coords: [6.5243, 3.3789], floors: 1, desc: "24/7 campus security with emergency response and patrol services." },
];

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "academic", label: "Academic" },
  { value: "amenity", label: "Amenities" },
  { value: "transport", label: "Transport" },
  { value: "safety", label: "Safety" },
];

// Custom marker icon
function createIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,0.9);"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

const CATEGORY_COLORS = { academic: "#FF8A2A", amenity: "#22C55E", transport: "#3B82F6", safety: "#EF4444" };

export default function CampusNavigation() {
  const [filter, setFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [showList, setShowList] = React.useState(true);

  const filtered = BUILDINGS.filter((b) => {
    if (filter !== "all" && b.category !== filter) return false;
    if (query && !b.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full max-w-[520px] mx-auto safe-area-pt relative" style={{ height: "100vh" }}>
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-5 pt-8 pb-3" style={{ background: "linear-gradient(180deg, rgba(10,7,5,0.95) 60%, transparent)" }}>
        <div className="flex items-center gap-3 mb-3">
          <Link to="/home" className="w-10 h-10 rounded-full grid place-items-center spring-tap shrink-0" style={{ background: "rgba(44,33,26,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: CREAM }}>Campus Map</h1>
            <p className="text-[12px]" style={{ color: CREAM_MUTED }}>{filtered.length} locations</p>
          </div>
          <button onClick={() => setShowList(!showList)} className="w-10 h-10 rounded-full grid place-items-center spring-tap shrink-0" style={{ background: "rgba(44,33,26,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {showList ? <MapPin className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: ORANGE }} /> : <Layers className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: ORANGE }} />}
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" strokeWidth={1.8} style={{ color: CREAM_MUTED }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search buildings…" className="w-full h-10 pl-10 pr-9 rounded-[14px] text-[13px] outline-none" style={{ background: "rgba(44,33,26,0.8)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
          {query && <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full grid place-items-center spring-tap"><X className="w-3.5 h-3.5" style={{ color: CREAM_MUTED }} /></button>}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setFilter(c.value)} className="px-3 h-8 rounded-full text-[11px] font-medium whitespace-nowrap spring-tap" style={filter === c.value ? { background: "rgba(255,138,42,0.15)", color: ORANGE, border: "1px solid rgba(255,138,42,0.3)" } : { background: "rgba(44,33,26,0.6)", color: CREAM_MUTED, border: "1px solid rgba(255,255,255,0.05)" }}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0 z-[500]" style={{ background: "#1a1208" }}>
        <MapContainer center={CAMPUS_CENTER} zoom={16} style={{ width: "100%", height: "100%" }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {filtered.map((b) => (
            <Marker key={b.id} position={b.coords} icon={createIcon(CATEGORY_COLORS[b.category])} eventHandlers={{ click: () => { setSelected(b); setShowList(false); } }}>
              <Popup>
                <div style={{ minWidth: "150px" }}>
                  <strong>{b.name}</strong>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Building List */}
      <AnimatePresence>
        {showList && (
          <motion.div className="absolute bottom-0 left-0 right-0 z-[1000] rounded-t-[28px] p-5 pb-10" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 36 }} style={{ background: "rgba(20,14,10,0.97)", border: "1px solid rgba(255,255,255,0.06)", maxHeight: "50vh", overflowY: "auto" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="flex flex-col gap-2.5">
              {filtered.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.button key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, ease: EASE }} onClick={() => { setSelected(b); setShowList(false); }} className="flex items-center gap-3 p-3 rounded-[14px] text-left spring-tap" style={{ background: "rgba(44,33,26,0.5)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: `${CATEGORY_COLORS[b.category]}1a` }}><Icon className="w-5 h-5" style={{ color: CATEGORY_COLORS[b.category] }} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate" style={{ color: CREAM }}>{b.name}</p>
                      <p className="text-[11px]" style={{ color: CREAM_MUTED }}>{b.floors} floor{b.floors > 1 ? "s" : ""} · {b.category}</p>
                    </div>
                    <Navigation className="w-4 h-4 shrink-0" style={{ color: CREAM_MUTED }} />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Building Detail */}
      <AnimatePresence>
        {selected && <BuildingDetail building={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function BuildingDetail({ building, onClose }) {
  const Icon = building.icon;
  const color = CATEGORY_COLORS[building.category];
  return (
    <motion.div className="fixed inset-0 z-[2000] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 36 }} className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] p-6 pb-10" style={{ background: "rgba(20,14,10,0.98)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.1)" }} />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(255,255,255,0.05)" }}><X className="w-4 h-4" style={{ color: CREAM_MUTED }} /></button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-[16px] grid place-items-center shrink-0" style={{ background: `${color}1a` }}><Icon className="w-7 h-7" style={{ color }} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold" style={{ color: CREAM }}>{building.name}</p>
            <p className="text-[12px] capitalize" style={{ color: CREAM_MUTED }}>{building.category} · {building.floors} floor{building.floors > 1 ? "s" : ""}</p>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed mb-5" style={{ color: CREAM_MUTED }}>{building.desc}</p>

        {/* Floor selector */}
        <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: CREAM_MUTED }}>Floors</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {Array.from({ length: building.floors }, (_, i) => (
            <button key={i} className="w-12 h-12 rounded-[12px] flex items-center justify-center text-[13px] font-semibold spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }}>
              {i + 1}F
            </button>
          ))}
        </div>

        <Link to="/campus-services" className="w-full h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[14px] spring-tap" style={{ background: ORANGE, color: "#1a1208" }}>
          <Navigation className="w-4 h-4" /> Get Directions
        </Link>
      </motion.div>
    </motion.div>
  );
}