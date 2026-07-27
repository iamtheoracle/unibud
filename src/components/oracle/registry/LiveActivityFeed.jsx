import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, FileCheck, BookPlus, ClipboardCheck, Sparkles, Users, Building2, Bell, Activity as ActivityIcon,
} from "lucide-react";
import { useRegistryActivity } from "@/lib/oracle/useRegistryMetrics";
import { mapActivity } from "@/lib/oracle/registryMetrics";
import { cn } from "@/lib/utils";

const ICONS = { UserPlus, FileCheck, BookPlus, ClipboardCheck, Sparkles, Users, Building2, Bell, Activity: ActivityIcon };

const EASE = [0.16, 1, 0.3, 1];

const relTime = (iso) => {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const SEV_DOT = { critical: "bg-destructive", warning: "bg-warning", info: "bg-information" };

export default function LiveActivityFeed({ filters }) {
  const { data: audit = [], isLoading } = useRegistryActivity(filters);

  const events = useMemo(() => audit.map(mapActivity), [audit]);

  return (
    <section className="crystal-card radius-xl p-4 h-full flex flex-col edge-light">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl grid place-items-center bg-primary/15">
          <ActivityIcon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-[15px] text-foreground leading-none">Live Activity</h2>
          <p className="text-[11px] text-muted-foreground mt-1">Newest first · from the audit registry</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-success live-pulse" />live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar -mx-1 px-1 space-y-1 min-h-0">
        {isLoading && events.length === 0 && (
          <div className="py-8 text-center text-[12px] text-muted-foreground">Loading activity…</div>
        )}
        {!isLoading && events.length === 0 && (
          <div className="py-8 text-center text-[12px] text-muted-foreground">No activity recorded yet.</div>
        )}
        {events.map((e, i) => {
          const Icon = ICONS[e.icon] || ActivityIcon;
          return (
            <motion.div
              key={e.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: Math.min(i * 0.02, 0.3) }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/30 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg glass grid place-items-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-foreground truncate">{e.label}</p>
                <p className="text-[10.5px] text-muted-foreground truncate">
                  {e.actor}{e.target ? ` · ${e.target}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn("w-1.5 h-1.5 rounded-full", SEV_DOT[e.severity] || SEV_DOT.info)} />
                <span className="text-[10px] text-muted-foreground tabular-nums">{relTime(e.time)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}