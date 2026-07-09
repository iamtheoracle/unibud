import React from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const communities = [
  { name: "Computer Science Hub", members: "1.2k", icon: "💻" },
  { name: "Chess Club", members: "89", icon: "♟️" },
  { name: "Entrepreneurship Hub", members: "312", icon: "🚀" },
  { name: "Music Lovers", members: "204", icon: "🎵" },
];

export default function CommunitiesPreview() {
  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A]">Communities</h3>
        <button className="text-[12px] font-semibold text-[#28A745] flex items-center">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {communities.map((c, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3 flex-shrink-0 w-[130px] text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-2xl mx-auto mb-2">{c.icon}</div>
            <p className="font-semibold text-[11px] text-[#1A1A1A] leading-tight">{c.name}</p>
            <p className="text-[10px] text-[#86868B] mt-0.5">{c.members} members</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}