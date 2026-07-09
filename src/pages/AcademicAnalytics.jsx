import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnalyticsDashboard from "@/components/academics/AnalyticsDashboard";

export default function AcademicAnalytics() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center gap-3"
      >
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div>
          <h1 className="font-heading font-extrabold text-[20px] tracking-tight text-foreground">Academic Analytics</h1>
          <p className="text-[11px] text-muted-foreground">Full performance breakdown & predictions</p>
        </div>
      </motion.div>
      <div className="px-4">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}