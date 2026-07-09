import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const matches = [
  { name: "Chioma Eze", course: "CSC 302", match: "92%", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
  { name: "David Okonkwo", course: "PHY 203", match: "85%", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
  { name: "Aisha Bello", course: "CSC 302", match: "78%", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80" },
];

export default function StudyMatching() {
  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Sparkles className="w-4 h-4 text-[#28A745]" />
        <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A]">Study Partners</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {matches.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3 flex-shrink-0 w-[140px]"
          >
            <div className="relative">
              <img src={m.avatar} alt={m.name} className="w-full h-20 rounded-xl object-cover mb-2" />
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#28A745] text-white text-[9px] font-bold">{m.match}</span>
            </div>
            <p className="font-heading font-semibold text-[12px] text-[#1A1A1A] truncate">{m.name}</p>
            <p className="text-[10px] text-[#86868B]">{m.course}</p>
            <button className="w-full mt-2 py-1.5 rounded-lg bg-[#28A745]/10 text-[#28A745] text-[11px] font-semibold">Connect</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}