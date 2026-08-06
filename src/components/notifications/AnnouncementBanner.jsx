import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Megaphone, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * AnnouncementBanner — surfaces pinned, emergency, and critical
 * notifications as dismissible banners at the top of the screen.
 * Covers: announcement banners, in-app announcements, emergency alerts.
 */
export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = React.useState([]);

  const { data: banners } = useQuery({
    queryKey: ["announcement-banners"],
    queryFn: async () => {
      const all = await base44.entities.Notification.filter(
        { pinned: true, is_read: false },
        "-created_date",
        5
      );
      return all || [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const visible = (banners || []).filter((b) => !dismissed.includes(b.id));

  return (
    <AnimatePresence>
      {visible.map((n) => {
        const isEmergency = n.priority === "critical" || n.category === "emergency";
        const Icon = isEmergency ? AlertTriangle : Megaphone;
        const accent = isEmergency ? "destructive" : "primary";
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] mb-2 border ${
                isEmergency
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-primary/8 border-primary/20"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isEmergency ? "text-destructive" : "text-primary"}`}
                strokeWidth={2}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{n.title}</p>
                {n.message && (
                  <p className="text-[12px] text-muted-foreground truncate">{n.message}</p>
                )}
              </div>
              {n.link && (
                <Link
                  to={n.link}
                  className="shrink-0 text-[12px] font-semibold text-primary flex items-center gap-0.5 spring-tap"
                >
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              )}
              <button
                onClick={() => setDismissed((d) => [...d, n.id])}
                className="shrink-0 p-1 rounded-full hover:bg-muted/40 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}