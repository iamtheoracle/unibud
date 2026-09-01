import React from "react";
import { motion } from "framer-motion";
import { Users, X, Lock, Mic, Video } from "lucide-react";

const BREAKOUT_ROOMS = [
  { id: 1, name: "Group A — Binary Trees", members: 4, max: 6 },
  { id: 2, name: "Group B — Graphs", members: 3, max: 6 },
  { id: 3, name: "Group C — Sorting", members: 5, max: 6 },
];

export default function BreakoutRooms({ onClose }) {
  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute inset-0 z-50 bg-card flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
        <Users className="w-5 h-5 text-primary" />
        <p className="font-heading font-bold text-[14px] text-foreground flex-1">Breakout Rooms</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {BREAKOUT_ROOMS.map(room => (
          <div key={room.id} className="bg-muted/30 rounded-2xl p-3.5 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <p className="font-heading font-semibold text-[13px] text-foreground">{room.name}</p>
              <span className="text-[10px] text-muted-foreground font-medium">{room.members}/{room.max}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {Array.from({ length: Math.min(room.members, 4) }).map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-primary/30 border-2 border-card" />
                ))}
              </div>
              <button className="ml-auto px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-semibold">Join</button>
            </div>
          </div>
        ))}
        <button className="w-full py-3 rounded-2xl border-2 border-dashed border-border/40 text-muted-foreground text-[12px] font-semibold hover:border-primary/30 hover:text-primary transition-colors">+ Create Breakout Room</button>
      </div>
    </motion.div>
  );
}