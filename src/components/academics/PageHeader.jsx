import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * PageHeader — back to Home + title + optional action, for academic
 * sub-pages rendered inside the AppShell.
 */
export default function PageHeader({ title, action }) {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-5 pt-1">
      <button onClick={() => navigate("/home")} className="text-muted-foreground spring-tap">
        <span className="text-[13px] font-medium">‹ Back</span>
      </button>
      <h1 className="flex-1 text-center font-heading font-bold text-[18px] text-foreground">{title}</h1>
      <div className="min-w-[44px] text-right">{action}</div>
    </motion.div>
  );
}