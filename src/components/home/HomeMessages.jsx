import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function HomeMessages({ count, total }) {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate("/messages")}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="glass-card p-5 w-full text-left spring-tap"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-info/12 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-info" />
          </span>
          <div>
            <p className="font-heading font-bold text-[15px] text-foreground">Messages</p>
            <p className="text-[11px] text-muted-foreground">
              {count > 0 ? `${count} unread` : "All caught up"}
              {total ? ` · ${total} conversations` : ""}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.button>
  );
}