import React from "react";
import { Flame, TrendingUp, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const trending = [
  { title: "CSC 302 study group forming for exam prep", engagement: "32 discussing", type: "study" },
  { title: "Inter-University Hackathon registration opens Friday", engagement: "128 interested", type: "event" },
  { title: "Student Union election results announced", engagement: "89 reactions", type: "news" },
  { title: "Best study spots on campus — share yours", engagement: "45 comments", type: "discussion" },
];

export default function TrendingSection() {
  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Flame className="w-4 h-4 text-warning" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Trending on Campus</h3>
      </div>
      <div className="space-y-2">
        {trending.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full bg-card rounded-2xl shadow-sm border border-border/30 p-3 flex items-center gap-3 text-left"
          >
            <span className="font-heading font-extrabold text-[18px] text-muted w-5">{i + 1}</span>
            <div className="flex-1">
              <p className="font-medium text-[12px] text-foreground leading-snug">{item.title}</p>
              <div className="flex items-center gap-1 mt-1">
                {item.type === "study" && <TrendingUp className="w-3 h-3 text-muted-foreground" />}
                {item.type === "discussion" && <MessageCircle className="w-3 h-3 text-muted-foreground" />}
                <span className="text-[10px] text-muted-foreground font-medium">{item.engagement}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}