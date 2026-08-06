import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * FloatingControlBar — sticky floating glass control bar for hub pages.
 *
 * Renders a premium glass pill with search, filter, notification,
 * and quick action buttons. Search expands inline when tapped.
 *
 * Props:
 *  - onSearch: (query) => void
 *  - onFilter: () => void
 *  - onNotifications: () => void
 *  - onQuickAction: () => void
 *  - searchPlaceholder: string
 *  - notificationCount: number
 *  - showQuickAction: boolean
 *  - className: extra
 */
export default function FloatingControlBar({
  onSearch,
  onFilter,
  onNotifications,
  onQuickAction,
  searchPlaceholder = "Search…",
  notificationCount = 0,
  showQuickAction = true,
  className = "",
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className={cn("relative z-30", className)}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-center gap-2 p-2 rounded-[22px] crystal-dock"
      >
        {/* Search */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.form
              key="search-input"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              onSubmit={handleSearchSubmit}
              className="flex-1 flex items-center"
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-[13px] text-foreground outline-none px-2 h-9 min-w-0"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center spring-tap flex-shrink-0"
              >
                <Search className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </button>
            </motion.form>
          ) : (
            <motion.button
              key="search-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-full luxury-capsule flex items-center justify-center spring-tap flex-shrink-0"
            >
              <Search className="w-4.5 h-4.5 text-foreground" strokeWidth={2} style={{ width: 18, height: 18 }} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Filter */}
        {onFilter && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onFilter}
            className="w-10 h-10 rounded-full luxury-capsule flex items-center justify-center spring-tap flex-shrink-0"
          >
            <SlidersHorizontal className="w-4.5 h-4.5 text-foreground" strokeWidth={2} style={{ width: 18, height: 18 }} />
          </motion.button>
        )}

        {/* Notifications */}
        {onNotifications && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onNotifications}
            className="relative w-10 h-10 rounded-full luxury-capsule flex items-center justify-center spring-tap flex-shrink-0"
          >
            <Bell className="w-4.5 h-4.5 text-foreground" strokeWidth={2} style={{ width: 18, height: 18 }} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive flex items-center justify-center">
                <span className="text-[8px] font-bold text-destructive-foreground">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              </span>
            )}
          </motion.button>
        )}

        {/* Quick action */}
        {showQuickAction && onQuickAction && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onQuickAction}
            className="h-10 px-4 rounded-full bg-primary flex items-center gap-1.5 spring-tap flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-primary-foreground" strokeWidth={2.8} />
            <span className="text-[12px] font-bold text-primary-foreground">New</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}