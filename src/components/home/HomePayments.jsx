import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function HomePayments({ count, overdue, fees }) {
  const navigate = useNavigate();
  const total = (fees || []).reduce((s, f) => s + (f.amount || 0), 0);
  const fmt = (n) => "₦" + Math.round(n).toLocaleString();
  const iconCls = overdue > 0 ? "bg-destructive/12" : "bg-warning/12";
  const glyphCls = overdue > 0 ? "text-destructive" : "text-warning";

  return (
    <motion.button
      onClick={() => navigate("/finance")}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="glass-card p-5 w-full text-left spring-tap"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
            <Wallet className={`w-5 h-5 ${glyphCls}`} />
          </span>
          <div>
            <p className="font-heading font-bold text-[15px] text-foreground">Payments</p>
            <p className="text-[11px] text-muted-foreground">
              {overdue > 0 ? `${overdue} overdue` : count > 0 ? `${count} pending` : "Nothing due"}
              {total > 0 ? ` · ${fmt(total)}` : ""}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.button>
  );
}