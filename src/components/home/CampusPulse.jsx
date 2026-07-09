import React from "react";
import { Flame, Users, TrendingUp, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const pulseItems = [
  {
    title: "CSC 302 Study Group forming — Data Structures exam prep",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80",
    activity: "32 discussing",
    type: "study",
  },
  {
    title: "Inter-University Hackathon registration opens Friday",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&q=80",
    activity: "128 interested",
    type: "event",
  },
  {
    title: "Scholarship alert: MTN Foundation Science Scholarship",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80",
    activity: "56 saved",
    type: "opportunity",
  },
];

export default function CampusPulse() {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-foreground">Campus Pulse</h3>
        <Flame className="w-4 h-4 text-warning" />
      </div>
      <div className="space-y-2.5">
        {pulseItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden flex items-center gap-3.5 p-2.5 card-hover"
          >
            <div className="w-14 h-14 rounded-[14px] overflow-hidden flex-shrink-0 bg-muted">
              <img src={item.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[13px] text-foreground leading-snug line-clamp-2">{item.title}</p>
              <div className="flex items-center gap-1 mt-1">
                {item.type === "study" && <Users className="w-3 h-3 text-muted-foreground" />}
                {item.type === "event" && <TrendingUp className="w-3 h-3 text-muted-foreground" />}
                {item.type === "opportunity" && <MessageCircle className="w-3 h-3 text-muted-foreground" />}
                <span className="text-[10px] text-muted-foreground font-medium">{item.activity}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}