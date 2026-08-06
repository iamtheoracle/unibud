import React from "react";
import { motion } from "framer-motion";
import {
  Building2, BookOpen, Home, UtensilsCrossed, Library, Dumbbell,
  FlaskConical, CalendarDays, Users, Navigation, MapPin, Sparkles,
} from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { EASE } from "@/lib/motion/motionPresets";

const BUILDING_TYPES = {
  lecture_hall: { icon: BookOpen, label: "Lecture Hall", color: "hsl(217 91% 60%)" },
  department: { icon: Building2, label: "Department", color: "hsl(142 71% 45%)" },
  hostel: { icon: Home, label: "Hostel", color: "hsl(280 65% 60%)" },
  restaurant: { icon: UtensilsCrossed, label: "Food", color: "hsl(24 90% 55%)" },
  library: { icon: Library, label: "Library", color: "hsl(46 74% 55%)" },
  sports: { icon: Dumbbell, label: "Sports Center", color: "hsl(0 84% 60%)" },
  lab: { icon: FlaskConical, label: "Laboratory", color: "hsl(200 80% 55%)" },
  event: { icon: CalendarDays, label: "Event", color: "hsl(251 90% 67%)" },
};

/**
 * CampusMapWidget — mini campus map showing nearby buildings, events, and friends.
 *
 * Props:
 *  - buildings: [{ id, name, type, distance_m }]
 *  - nearbyEvents: [{ id, title, location, date }]
 *  - friendsNearby: [{ id, name, image }]
 *  - onBuildingPress: (building) => void
 *  - onEventPress: (event) => void
 *  - onNavigate: () => void
 */
export default function CampusMapWidget({ buildings = [], nearbyEvents = [], friendsNearby = [], onBuildingPress, onEventPress, onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="crystal-card rounded-[16px] overflow-hidden"
    >
      {/* Map header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
          <h4 className="text-[13px] font-bold text-foreground">Campus Map</h4>
        </div>
        <button onClick={onNavigate} className="flex items-center gap-1 px-2 py-1 rounded-full glass text-[10px] font-bold text-foreground spring-tap">
          <Navigation className="w-2.5 h-2.5" strokeWidth={2.2} />
          Navigate
        </button>
      </div>

      {/* Map preview area */}
      <div className="relative h-28 bg-gradient-to-br from-primary/8 via-muted/20 to-transparent overflow-hidden">
        {/* Stylized map grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />

        {/* Building pins */}
        {buildings.slice(0, 4).map((b, i) => {
          const config = BUILDING_TYPES[b.type] || BUILDING_TYPES.lecture_hall;
          const Icon = config.icon;
          const positions = [
            { top: "20%", left: "15%" },
            { top: "55%", left: "40%" },
            { top: "25%", left: "65%" },
            { top: "60%", left: "75%" },
          ];
          const pos = positions[i] || positions[0];

          return (
            <motion.button
              key={b.id || i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => onBuildingPress?.(b)}
              className="absolute w-7 h-7 rounded-full flex items-center justify-center spring-tap"
              style={{ ...pos, background: `${config.color}25`, border: `1px solid ${config.color}40` }}
            >
              <Icon className="w-3 h-3" strokeWidth={2.2} style={{ color: config.color }} />
            </motion.button>
          );
        })}

        {/* Friends nearby */}
        {friendsNearby.length > 0 && (
          <div className="absolute bottom-2 right-2 flex -space-x-2">
            {friendsNearby.slice(0, 3).map((f, i) => (
              <motion.div
                key={f.id || i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="w-6 h-6 rounded-full border-2 border-background overflow-hidden"
              >
                <PremiumAvatar src={f.image} alt={f.name} size="xs" />
              </motion.div>
            ))}
            {friendsNearby.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                <span className="text-[8px] font-bold text-muted-foreground">+{friendsNearby.length - 3}</span>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {buildings.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <MapPin className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.8} />
            <p className="text-[10px] text-muted-foreground">Map loading...</p>
          </div>
        )}
      </div>

      {/* Nearby events */}
      {nearbyEvents.length > 0 && (
        <div className="px-3 py-2.5 border-t border-border/30">
          <div className="flex items-center gap-1 mb-1.5">
            <CalendarDays className="w-3 h-3 text-primary" strokeWidth={2.2} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Happening Nearby</span>
          </div>
          <div className="space-y-1">
            {nearbyEvents.slice(0, 2).map((ev, i) => (
              <motion.div
                key={ev.id || i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => onEventPress?.(ev)}
                className="flex items-center gap-2 p-1.5 rounded-[10px] glass cursor-pointer spring-tap"
              >
                <CalendarDays className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={2.2} />
                <span className="text-[10px] text-foreground truncate flex-1">{ev.title}</span>
                {ev.location && <span className="text-[8px] text-muted-foreground">{ev.location}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Friends nearby count */}
      {friendsNearby.length > 0 && (
        <div className="px-3 py-2 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
            <span className="text-[10px] text-muted-foreground">
              {friendsNearby.length} friend{friendsNearby.length > 1 ? "s" : ""} nearby
            </span>
          </div>
        </div>
      )}

      {/* Bud tip */}
      <div className="px-3 py-2 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-2.5 h-2.5 text-primary" strokeWidth={2.2} />
          <p className="text-[9px] text-muted-foreground italic">Bud can navigate you to your next class.</p>
        </div>
      </div>
    </motion.div>
  );
}

export { BUILDING_TYPES };