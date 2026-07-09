import React from "react";
import { CloudSun, Droplets, Wind, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function WeatherCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-5 premium-shadow bg-gradient-to-br from-info to-info/80"
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-4 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <CloudSun className="w-5 h-5 text-white/90" />
              <span className="text-white/80 text-[12px] font-medium">Partly Cloudy</span>
            </div>
            <p className="text-white/60 text-[11px] mt-0.5">University of Benin</p>
          </div>
          <span className="font-heading font-extrabold text-[40px] text-white leading-none">28°</span>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/20">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-white/70" />
            <div>
              <p className="text-white/50 text-[9px] font-medium uppercase tracking-wide">Humidity</p>
              <p className="text-white text-[12px] font-semibold">64%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-white/70" />
            <div>
              <p className="text-white/50 text-[9px] font-medium uppercase tracking-wide">Wind</p>
              <p className="text-white text-[12px] font-semibold">12 km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-white/70" />
            <div>
              <p className="text-white/50 text-[9px] font-medium uppercase tracking-wide">Air</p>
              <p className="text-white text-[12px] font-semibold">Good</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}