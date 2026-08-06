import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { accessibleSurfaces } from "@/lib/admin/roles";
import { hapticTap } from "@/lib/haptics";

/**
 * AdminLaunchers — renders the administrator's authorized dashboards as
 * a responsive grid of premium glass cards. Each card deep-links into the
 * existing admin surface (no duplication of those workspaces).
 */
export default function AdminLaunchers({ role }) {
  const navigate = useNavigate();
  const surfaces = accessibleSurfaces(role);

  return (
    <div>
      <h2 className="text-[14px] font-semibold text-foreground mb-3">Your Dashboards</h2>
      <div className="grid grid-cols-2 gap-3">
        {surfaces.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.03 }}
              onClick={() => { hapticTap(); navigate(s.to); }}
              className="rounded-[20px] p-4 glass-card card-hover text-left"
            >
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-3" style={{ background: `hsl(${s.color} / 0.14)` }}>
                <Icon className="w-5 h-5" style={{ color: `hsl(${s.color})` }} />
              </div>
              <p className="text-[13px] font-semibold text-foreground leading-tight">{s.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Open workspace</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}