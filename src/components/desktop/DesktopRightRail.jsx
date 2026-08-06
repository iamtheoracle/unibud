import React from "react";
import { motion } from "framer-motion";
import { Bell, CalendarDays, CheckSquare, Sparkles, Users, Bookmark } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

const RAIL_SECTIONS = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "calendar", label: "Today", icon: CalendarDays },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "friends", label: "Online", icon: Users },
  { id: "collections", label: "Pinned", icon: Bookmark },
];

/**
 * DesktopRightRail — right sidebar with contextual widgets.
 *
 * Props:
 *  - activeSection: string
 *  - onSectionChange: (id) => void
 *  - onOpenWindow: (module, title) => void
 */
export default function DesktopRightRail({ activeSection = "notifications", onSectionChange, onOpenWindow }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full w-[280px] border-l border-border/30 bg-background/40 backdrop-blur-xl"
    >
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 h-12 px-2 border-b border-border/20 flex-shrink-0">
        {RAIL_SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSectionChange?.(s.id)}
              className={cn(
                "flex-1 h-8 rounded-[8px] flex items-center justify-center spring-tap",
                active ? "glass text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <RailContent section={activeSection} onOpenWindow={onOpenWindow} />
      </div>

      {/* Quick Bud */}
      <button
        onClick={() => onOpenWindow?.("bud", "Bud")}
        className="flex items-center gap-2.5 h-12 mx-2 mb-2 rounded-[12px] glass spring-tap flex-shrink-0"
      >
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" strokeWidth={2.2} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[11px] font-bold text-foreground">Ask Bud</p>
          <p className="text-[9px] text-muted-foreground truncate">Your campus companion</p>
        </div>
      </button>
    </motion.aside>
  );
}

function RailContent({ section, onOpenWindow }) {
  const emptyProps = {
    no_notifications: { icon: Bell, title: "No Notifications", description: "You're all caught up. New notifications will appear here.", budGuidance: "Bud will alert you when something important happens on campus." },
    no_events: { icon: CalendarDays, title: "No Events Today", description: "Your calendar is clear for today. Check upcoming events or add your own.", budGuidance: "Sync your academic calendar to see lectures and deadlines here." },
    no_tasks: { icon: CheckSquare, title: "No Pending Tasks", description: "You have no tasks right now. Create one to stay on top of your work.", budGuidance: "Bud can help you break down assignments into manageable tasks." },
    no_friends: { icon: Users, title: "No Friends Online", description: "None of your friends are online right now. Connect with more classmates to see them here.", budGuidance: "Discover students in your faculty and department to build your network." },
    no_collections: { icon: Bookmark, title: "No Pinned Collections", description: "Pin your favorite collections to access them quickly from here.", budGuidance: "Save content to collections to revisit them later from any device." },
  };

  const key = `no_${section}`;
  const config = emptyProps[key] || emptyProps.no_notifications;

  return (
    <div className="p-2">
      <div className="py-8">
        <EmptyState
          icon={config.icon}
          title={config.title}
          description={config.description}
          budGuidance={config.budGuidance}
        />
      </div>
    </div>
  );
}