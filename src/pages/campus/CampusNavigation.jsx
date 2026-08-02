import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import CampusLocationSheet from "@/components/campus/CampusLocationSheet";
import {
  ArrowLeft, Search, X, MapPin, Navigation, Star,
  BookOpen, Building2, Home, Library, UtensilsCrossed, Plus,
  Car, CalendarDays, Dumbbell, FlaskConical, Locate, Heart,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORY_CONFIG = {
  classroom: { icon: BookOpen, label: "Classroom", color: "#FF7A00" },
  lecture_hall: { icon: Building2, label: "Lecture Hall", color: "#FF7A00" },
  hostel: { icon: Home, label: "Hostel", color: "#4A2C1D" },
  library: { icon: Library, label: "Library", color: "#6B4A35" },
  cafeteria: { icon: UtensilsCrossed, label: "Cafeteria", color: "#FFA64D" },
  medical_center: { icon: Plus, label: "Medical Center", color: "#EF4444" },
  parking: { icon: Car, label: "Parking", color: "#737373" },
  event_venue: { icon: CalendarDays, label: "Event Venue", color: "#FF7A00" },
  administrative: { icon: Building2, label: "Administrative", color: "#2E1B12" },
  sports: { icon: Dumbbell, label: "Sports", color: "#22C55E" },
  lab: { icon: FlaskConical, label: "Laboratory", color: "#FF7A00" },
  other: { icon: MapPin, label: "Other", color: "#737373" },
};

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "classroom", label: "Classrooms" },
  { value: "lecture_hall", label: "Lecture Halls" },
  { value: "hostel", label: "Hostels" },
  { value: "library", label: "Libraries" },
  { value: "cafeteria", label: "Cafeterias" },
  { value: "medical_center", label: "Medical" },
  { value: "parking", label: "Parking" },
  { value: "event_venue", label: "Venues" },
];

function createMarkerIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.9);"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function formatDuration(s) {
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min walk`;
  return `${Math.floor(min / 60)}h ${min % 60}m walk`;
}

function MapController({ selected, route, recenterTrigger, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], 18, { duration: 0.8 });
    }
  }, [selected, map]);

  useEffect(() => {
    if (route && route.length > 0) {
      map.fitBounds(route, { padding: [60, 60] });
    }
  }, [route, map]);

  useEffect(() => {
    if (recenterTrigger > 0 && userLocation) {
      map.flyTo(userLocation, 17, { duration: 0.8 });
    }
  }, [recenterTrigger, userLocation, map]);

  return null;
}

export default function CampusNavigation() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showList, setShowList] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [initialCenter, setInitialCenter] = useState(null);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["campusLocations"],
    queryFn: () => base44.entities.CampusLocation.list("-created_date", 200),
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setLocationDenied(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!initialCenter) {
      if (userLocation) setInitialCenter(userLocation);
      else if (locations?.length > 0) setInitialCenter([locations[0].latitude, locations[0].longitude]);
    }
  }, [userLocation, locations, initialCenter]);

  const filtered = useMemo(() => {
    let list = [...(locations || [])];
    if (filter !== "all") list = list.filter((l) => l.category === filter);
    if (showFavorites) list = list.filter((l) => l.favorited_by?.includes(user?.id));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.name?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.building?.toLowerCase().includes(q) ||
        l.address?.toLowerCase().includes(q) ||
        l.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (userLocation) {
      list = list.map((l) => ({
        ...l,
        _distance: haversine(userLocation[0], userLocation[1], l.latitude, l.longitude),
      })).sort((a, b) => (a._distance || 0) - (b._distance || 0));
    }
    return list;
  }, [locations, filter, showFavorites, search, userLocation, user?.id]);

  const toggleFavorite = async (location) => {
    const list = location.favorited_by || [];
    const next = list.includes(user?.id) ? list.filter((id) => id !== user?.id) : [...list, user?.id];
    qc.setQueryData(["campusLocations"], (old) => (old || []).map((l) => l.id === location.id ? { ...l, favorited_by: next } : l));
    if (selected?.id === location.id) setSelected({ ...location, favorited_by: next });
    try {
      await base44.entities.CampusLocation.update(location.id, { favorited_by: next });
    } catch {
      toast({ title: "Couldn't update favorite", variant: "destructive" });
    }
  };

  const getDirections = async (location) => {
    if (!userLocation) {
      toast({ title: "Location access needed", description: "Enable location to get walking directions.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${userLocation[1]},${userLocation[0]};${location.longitude},${location.latitude}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes?.[0]) {
        const r = data.routes[0];
        const coords = r.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        setRoute(coords);
        setRouteInfo({ distance: r.distance, duration: r.duration });
        setShowList(false);
      }
    } catch {
      toast({ title: "Couldn't fetch directions", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto safe-area-pt relative" style={{ height: "100vh" }}>
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-10 pb-3" style={{ background: "linear-gradient(180deg, hsl(var(--background) / 0.95) 60%, transparent)" }}>
        <div className="flex items-center gap-3 mb-3">
          <Link to="/campus" className="w-10 h-10 rounded-full glass-card flex items-center justify-center spring-tap shrink-0">
            <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-bold tracking-tight text-foreground">Campus Map</h1>
            <p className="text-[11px] text-muted-foreground">{filtered.length} locations{userLocation ? " · sorted by distance" : ""}</p>
          </div>
          <button onClick={() => setShowFavorites(!showFavorites)} className={`w-10 h-10 rounded-full flex items-center justify-center spring-tap shrink-0 ${showFavorites ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground"}`}>
            <Star className="w-[18px] h-[18px]" strokeWidth={1.8} fill={showFavorites ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search classrooms, hostels, libraries…" className="w-full h-10 pl-10 pr-9 rounded-[14px] text-[13px] outline-none glass-card text-foreground placeholder:text-muted-foreground" />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center spring-tap"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setFilter(c.value)} className={`px-3 h-8 rounded-full text-[11px] font-medium whitespace-nowrap spring-tap ${filter === c.value ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0 z-[500]" style={{ background: "hsl(var(--muted))" }}>
        {initialCenter ? (
          <MapContainer key={initialCenter.join(',')} center={initialCenter} zoom={16} style={{ width: "100%", height: "100%" }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <MapController selected={selected} route={route} recenterTrigger={recenterTrigger} userLocation={userLocation} />
            {filtered.map((loc) => {
              const config = CATEGORY_CONFIG[loc.category] || CATEGORY_CONFIG.other;
              return (
                <Marker
                  key={loc.id}
                  position={[loc.latitude, loc.longitude]}
                  icon={createMarkerIcon(config.color)}
                  eventHandlers={{ click: () => { setSelected(loc); setShowList(false); setRoute(null); setRouteInfo(null); } }}
                />
              );
            })}
            {route && (
              <Polyline positions={route} pathOptions={{ color: "#FF7A00", weight: 5, opacity: 0.75, lineCap: "round", lineJoin: "round" }} />
            )}
            {userLocation && (
              <CircleMarker center={userLocation} radius={8} pathOptions={{ color: "#FF7A00", fillColor: "#FF7A00", fillOpacity: 0.4, weight: 2 }} />
            )}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Recenter button */}
      {userLocation && (
        <button onClick={() => setRecenterTrigger(t => t + 1)} className="absolute right-4 z-[900] glass-card w-11 h-11 rounded-full flex items-center justify-center spring-tap" style={{ bottom: showList ? "52vh" : "24px" }}>
          <Locate className="w-5 h-5 text-primary" strokeWidth={2} />
        </button>
      )}

      {/* Route info banner */}
      {routeInfo && selected && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute left-4 right-4 z-[900] glass-strong rounded-[16px] p-3 flex items-center gap-3" style={{ top: "180px" }}>
          <Navigation className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-[12px] font-bold text-foreground">{formatDistance(routeInfo.distance)} · {formatDuration(routeInfo.duration)}</p>
            <p className="text-[10px] text-muted-foreground">Walking route to {selected.name}</p>
          </div>
          <button onClick={() => { setRoute(null); setRouteInfo(null); }} className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center spring-tap">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </motion.div>
      )}

      {/* Location List */}
      <AnimatePresence>
        {showList && !selected && (
          <motion.div className="absolute bottom-0 left-0 right-0 z-[1000] rounded-t-[24px] p-4 pb-8 glass-strong" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 36 }} style={{ maxHeight: "50vh", overflowY: "auto" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-3 bg-border" />
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-[14px] bg-muted/40 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 rounded-[18px] glass-card flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-foreground mb-1">{search ? "No results" : "No campus locations"}</p>
                <p className="text-[11px] text-muted-foreground max-w-[240px]">{search ? "Try a different search term" : "Your university hasn't added campus locations yet."}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((loc, i) => {
                  const config = CATEGORY_CONFIG[loc.category] || CATEGORY_CONFIG.other;
                  const Icon = config.icon;
                  const isFav = loc.favorited_by?.includes(user?.id);
                  return (
                    <motion.div key={loc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, ease: EASE }}>
                      <button onClick={() => { setSelected(loc); setShowList(false); setRoute(null); setRouteInfo(null); }} className="w-full flex items-center gap-3 p-2.5 rounded-[14px] text-left spring-tap glass-card">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${config.color}1a` }}>
                          <Icon className="w-5 h-5" style={{ color: config.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate text-foreground">{loc.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{config.label}{loc.building ? ` · ${loc.building}` : ""}{loc._distance != null ? ` · ${formatDistance(loc._distance)}` : ""}</p>
                        </div>
                        {isFav && <Heart className="w-3.5 h-3.5 text-primary fill-current shrink-0" />}
                        <Navigation className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Detail Sheet */}
      <AnimatePresence>
        {selected && (
          <CampusLocationSheet
            location={selected}
            userLocation={userLocation}
            locationDenied={locationDenied}
            isFavorite={selected.favorited_by?.includes(user?.id)}
            routeInfo={routeInfo}
            onClose={() => { setSelected(null); setRoute(null); setRouteInfo(null); }}
            onGetDirections={() => getDirections(selected)}
            onToggleFavorite={() => toggleFavorite(selected)}
            onShowList={() => { setSelected(null); setShowList(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}