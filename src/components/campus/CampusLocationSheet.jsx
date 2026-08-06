import React from "react";
import { motion } from "framer-motion";
import {
  X, Navigation, Star, MapPin, Building2, Clock, Phone, Mail,
  Check, Accessibility, ArrowUpDown, Users,
} from "lucide-react";

const ACCESSIBILITY_FEATURES = [
  { key: "wheelchair_accessible", label: "Wheelchair Access", icon: Accessibility },
  { key: "elevator", label: "Elevator", icon: ArrowUpDown },
  { key: "ramp", label: "Ramp", icon: Navigation },
  { key: "accessible_restroom", label: "Accessible Restroom", icon: Check },
  { key: "braille_signage", label: "Braille Signage", icon: Check },
  { key: "hearing_loop", label: "Hearing Loop", icon: Check },
];

const CATEGORY_LABELS = {
  classroom: "Classroom",
  lecture_hall: "Lecture Hall",
  hostel: "Hostel",
  library: "Library",
  cafeteria: "Cafeteria",
  medical_center: "Medical Center",
  parking: "Parking Area",
  event_venue: "Event Venue",
  administrative: "Administrative",
  sports: "Sports Facility",
  lab: "Laboratory",
  other: "Location",
};

function formatDistance(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function formatDuration(s) {
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min walk`;
  return `${Math.floor(min / 60)}h ${min % 60}m walk`;
}

export default function CampusLocationSheet({ location, userLocation, locationDenied, isFavorite, routeInfo, onClose, onGetDirections, onToggleFavorite, onShowList }) {
  const acc = location.accessibility || {};
  const hasAccessibility = Object.values(acc).some((v) => v === true);

  return (
    <motion.div className="fixed inset-0 z-[2000] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] p-5 pb-8 glass-strong no-scrollbar"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4 bg-border" />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center spring-tap">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-[16px] bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="w-7 h-7 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h2 className="text-[18px] font-bold text-foreground leading-tight">{location.name}</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">{CATEGORY_LABELS[location.category] || "Location"}</p>
          </div>
        </div>

        {/* Description */}
        {location.description && (
          <p className="text-[13px] text-foreground/80 leading-relaxed mb-4">{location.description}</p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {location.building && (
            <DetailItem icon={Building2} label="Building" value={location.building} />
          )}
          {location.floor && (
            <DetailItem icon={ArrowUpDown} label="Floor" value={location.floor} />
          )}
          {location.room_number && (
            <DetailItem icon={MapPin} label="Room" value={location.room_number} />
          )}
          {location.capacity > 0 && (
            <DetailItem icon={Users} label="Capacity" value={`${location.capacity} people`} />
          )}
        </div>

        {/* Hours */}
        {(location.opening_hours || location.closing_hours) && (
          <div className="glass-card p-3 rounded-[14px] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[12px] text-foreground">
              {location.opening_hours || "—"} – {location.closing_hours || "—"}
            </p>
          </div>
        )}

        {/* Contact */}
        {(location.contact_phone || location.contact_email) && (
          <div className="flex gap-2 mb-4">
            {location.contact_phone && (
              <a href={`tel:${location.contact_phone}`} className="flex-1 glass-card p-2.5 rounded-[12px] flex items-center gap-2 spring-tap">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-foreground truncate">{location.contact_phone}</span>
              </a>
            )}
            {location.contact_email && (
              <a href={`mailto:${location.contact_email}`} className="flex-1 glass-card p-2.5 rounded-[12px] flex items-center gap-2 spring-tap">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-foreground truncate">{location.contact_email}</span>
              </a>
            )}
          </div>
        )}

        {/* Accessibility */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <Accessibility className="w-3 h-3" /> Accessibility
          </p>
          {hasAccessibility ? (
            <div className="grid grid-cols-2 gap-1.5">
              {ACCESSIBILITY_FEATURES.map((feat) => {
                const available = acc[feat.key] === true;
                if (!available) return null;
                const Icon = feat.icon;
                return (
                  <div key={feat.key} className="glass-card p-2 rounded-[10px] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-success shrink-0" />
                    <span className="text-[10px] text-foreground font-medium">{feat.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground italic">No accessibility information available for this location.</p>
          )}
        </div>

        {/* Tags */}
        {location.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {location.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted/40 text-[10px] font-medium text-muted-foreground">#{tag}</span>
            ))}
          </div>
        )}

        {/* Route info */}
        {routeInfo && (
          <div className="glass-card p-3 rounded-[14px] mb-4 flex items-center gap-3 border border-primary/20">
            <Navigation className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-foreground">{formatDistance(routeInfo.distance)}</p>
              <p className="text-[10px] text-muted-foreground">{formatDuration(routeInfo.duration)}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onGetDirections}
            className="flex-1 h-12 rounded-[14px] bg-primary text-primary-foreground flex items-center justify-center gap-2 font-semibold text-[14px] spring-tap"
          >
            <Navigation className="w-4 h-4" />
            {routeInfo ? "Refresh Route" : "Get Directions"}
          </button>
          <button
            onClick={onToggleFavorite}
            className={`w-12 h-12 rounded-[14px] flex items-center justify-center spring-tap ${isFavorite ? "bg-primary/10" : "glass-card"}`}
          >
            <Star className={`w-5 h-5 ${isFavorite ? "text-primary fill-current" : "text-muted-foreground"}`} />
          </button>
        </div>

        {locationDenied && !routeInfo && (
          <p className="text-[10px] text-muted-foreground text-center mt-2">Enable location access for walking directions.</p>
        )}
      </motion.div>
    </motion.div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="glass-card p-2.5 rounded-[12px]">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-[12px] font-medium text-foreground truncate">{value}</p>
    </div>
  );
}