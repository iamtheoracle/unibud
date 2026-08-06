import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { UNIBUD_FILTERS, applyIntensity } from "@/data/unibudFilters";

/**
 * FilterStrip — horizontal scrollable preview of all 15 UNIBUD filters.
 * Each thumbnail shows the captured media with the filter applied.
 * Below the strip: an intensity slider (0–100%).
 */
export default function FilterStrip({ mediaUrl, selectedFilter, intensity, onFilterChange, onIntensityChange }) {
  const scrollRef = useRef(null);

  // Auto-scroll to selected filter
  useEffect(() => {
    if (!scrollRef.current || !selectedFilter) return;
    const el = scrollRef.current.querySelector(`[data-filter="${selectedFilter}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedFilter]);

  return (
    <div className="space-y-2.5">
      {/* Filter thumbnails */}
      <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-1">
        {UNIBUD_FILTERS.map((f) => {
          const isActive = selectedFilter === f.id;
          const css = applyIntensity(f.css, intensity);
          return (
            <button
              key={f.id}
              data-filter={f.id}
              onClick={() => onFilterChange(f.id)}
              className="flex flex-col items-center gap-1 shrink-0 spring-tap"
            >
              <div
                className={`relative w-[58px] h-[58px] rounded-[14px] overflow-hidden border-2 transition-all ${
                  isActive ? "border-primary scale-105" : "border-transparent"
                }`}
              >
                {mediaUrl ? (
                  <img
                    src={mediaUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: css }}
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: f.swatch }} />
                )}
              </div>
              <span
                className={`text-[9px] font-semibold whitespace-nowrap transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {f.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Intensity slider */}
      {selectedFilter && selectedFilter !== "natural" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 flex items-center gap-3"
        >
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground shrink-0">Intensity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(intensity * 100)}
            onChange={(e) => onIntensityChange(Number(e.target.value) / 100)}
            className="flex-1 h-1 accent-primary"
          />
          <span className="text-[10px] font-semibold text-foreground tabular-nums w-8 text-right">
            {Math.round(intensity * 100)}%
          </span>
        </motion.div>
      )}
    </div>
  );
}