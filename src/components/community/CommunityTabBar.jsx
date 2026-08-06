import React from "react";
import { motion } from "framer-motion";
import { Home, MessageSquare, CalendarDays, Users, Image as ImageIcon, Megaphone, Settings } from "lucide-react";

const PRIMARY_TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "feed", label: "Feed", icon: MessageSquare },
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "members", label: "Members", icon: Users },
];

const SECONDARY_TABS = [
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "announcements", label: "Info", icon: Megaphone },
  { key: "settings", label: "Settings", icon: Settings },
];

/**
 * CommunityTabBar — app-like bottom navigation that makes each community
 * feel like a dedicated application. Five primary destinations with a
 * dedicated crystal dock; secondary destinations accessible via "More".
 */
export default function CommunityTabBar({ activeTab, onChange, accentColor }) {
  const accent = accentColor || "0 0% 100%";
  const isSecondary = SECONDARY_TABS.some((t) => t.key === activeTab);
  const [showMore, setShowMore] = React.useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-pb">
        <div className="mx-auto max-w-[520px] px-3 pb-2">
          <div className="crystal-dock rounded-[24px] flex items-center justify-around px-2 py-1.5">
            {PRIMARY_TABS.map((tab) => {
              const on = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => onChange(tab.key)}
                  className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 spring-tap flex-1"
                >
                  {on && (
                    <motion.div
                      layoutId="comm-tab-pill"
                      className="absolute inset-0 rounded-[16px]"
                      style={{ background: `hsl(${accent} / 0.12)` }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={`w-[19px] h-[19px] relative z-10 transition-colors ${on ? "" : "text-muted-foreground"}`}
                    style={on ? { color: `hsl(${accent})` } : {}}
                    strokeWidth={2.2}
                  />
                  <span
                    className={`text-[9px] font-semibold relative z-10 transition-colors ${on ? "" : "text-muted-foreground"}`}
                    style={on ? { color: `hsl(${accent})` } : {}}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setShowMore(true)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 spring-tap flex-1 ${isSecondary ? "" : "text-muted-foreground"}`}
              style={isSecondary ? { color: `hsl(${accent})` } : {}}
            >
              <div className="flex gap-0.5 relative z-10">
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
              </div>
              <span className="text-[9px] font-semibold relative z-10">More</span>
            </button>
          </div>
        </div>
      </div>

      {showMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowMore(false)}
          className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-end safe-area-pb"
        >
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] mx-auto crystal-card rounded-t-[28px] p-5 pb-8"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
            <p className="text-[12px] font-semibold text-muted-foreground mb-3 px-1">More</p>
            <div className="grid grid-cols-3 gap-3">
              {SECONDARY_TABS.map((tab) => {
                const Icon = tab.icon;
                const on = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => { onChange(tab.key); setShowMore(false); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-[18px] spring-tap border ${on ? "border-primary/40 bg-primary/8" : "border-border/30 glass"}`}
                  >
                    <div
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                      style={{ background: `hsl(${accent} / 0.12)` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: `hsl(${accent})` }} strokeWidth={2.2} />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}