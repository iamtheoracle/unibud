import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function HomeCommunity({ count, posts }) {
  const navigate = useNavigate();
  const preview = posts?.[0]?.content || posts?.[0]?.title || posts?.[0]?.caption;

  return (
    <motion.button
      onClick={() => navigate("/quad")}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="glass-card p-5 w-full text-left spring-tap"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-primary/12 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="font-heading font-bold text-[15px] text-foreground">Campus Feed</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {count > 0 ? (preview ? String(preview).slice(0, 42) : `${count} new posts`) : "Quiet on campus"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.button>
  );
}