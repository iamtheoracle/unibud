import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Check, AlertCircle, Lightbulb, Accessibility } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const AMENITY_ICONS = {
  lighting: Lightbulb,
  accessibility: Accessibility,
};

/**
 * SportsFacilityCard — premium card for university sports facilities.
 *
 * Props:
 *  - facility: { name, photos: [], location, opening_hours, availability: "open"|"limited"|"closed", capacity, surface_type, amenities: [], equipment: [] }
 *  - onRequestBooking: () => void
 *  - onViewDetails: () => void
 *  - distance_m: number
 */
export default function SportsFacilityCard({ facility, onRequestBooking, onViewDetails, distance_m }) {
  if (!facility) return null;

  const availabilityConfig = {
    open: { color: "text-success", bg: "bg-success/15", label: "Available", icon: Check },
    limited: { color: "text-warning", bg: "bg-warning/15", label: "Limited", icon: AlertCircle },
    closed: { color: "text-destructive", bg: "bg-destructive/15", label: "Closed", icon: AlertCircle },
  };
  const avail = availabilityConfig[facility.availability] || availabilityConfig.open;
  const AvailIcon = avail.icon;
  const photo = facility.photos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      onClick={onViewDetails}
      className="crystal-card rounded-[18px] overflow-hidden cursor-pointer hover-elevate"
    >
      {/* Photo */}
      {photo && (
        <div className="relative h-32 overflow-hidden">
          <Image src={photo} alt={facility.name} fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Availability badge */}
          <div className={cn("absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md", avail.bg, avail.color)}>
            <AvailIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
            {avail.label}
          </div>

          {/* Distance */}
          {distance_m != null && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-white glass">
              <MapPin className="w-2.5 h-2.5" strokeWidth={2.5} />
              {distance_m < 1000 ? `${distance_m}m` : `${(distance_m / 1000).toFixed(1)}km`}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <h4 className="text-[13px] font-bold text-foreground truncate">{facility.name}</h4>

        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
          <span className="text-[10px] text-muted-foreground truncate">{facility.location}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
          <span className="text-[10px] text-muted-foreground">{facility.opening_hours || "Hours vary"}</span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2">
          {facility.capacity && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Users className="w-2.5 h-2.5" strokeWidth={2.2} />
              {facility.capacity}
            </span>
          )}
          {facility.surface_type && (
            <span className="text-[10px] text-muted-foreground capitalize">{facility.surface_type.replace("_", " ")}</span>
          )}
        </div>

        {/* Amenities */}
        {facility.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {facility.amenities.slice(0, 3).map((amenity) => {
              const Icon = AMENITY_ICONS[amenity] || Check;
              return (
                <span key={amenity} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full glass text-[8px] font-semibold text-muted-foreground capitalize">
                  <Icon className="w-2 h-2" strokeWidth={2.5} />
                  {amenity.replace("_", " ")}
                </span>
              );
            })}
            {facility.amenities.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-full glass text-[8px] font-semibold text-muted-foreground">
                +{facility.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {onRequestBooking && facility.availability !== "closed" && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation();
                onRequestBooking();
              }}
              className="flex-1 h-8 rounded-full bg-primary text-[11px] font-bold text-primary-foreground spring-tap"
            >
              Request Booking
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.();
            }}
            className={cn(
              "h-8 rounded-full glass text-[11px] font-bold text-foreground spring-tap",
              !onRequestBooking || facility.availability === "closed" ? "flex-1" : "px-4"
            )}
          >
            Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}