import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Home, MessagesSquare, GraduationCap, Store, CalendarDays,
  Users, Bookmark, User, Settings, Sparkles, FileText, ClipboardList,
  Radio, LayoutGrid, BookOpen, ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const COMMANDS = [
  { id: "home", label: "Go to Home", icon: Home, path: "/home", group: "Navigation" },
  { id: "orbit", label: "Go to Orbit", icon: Radio, path: "/social", group: "Navigation" },
  { id: "academic", label: "Go to Academic", icon: GraduationCap, path: "/academics", group: "Navigation" },
  { id: "messages", label: "Go to Messages", icon: MessagesSquare, path: "/messages", group: "Navigation" },
  { id: "marketplace", label: "Go to Marketplace", icon: Store, path: "/marketplace", group: "Navigation" },
  { id: "events", label: "Go to Events", icon: CalendarDays, path: "/events", group: "Navigation" },
  { id: "communities", label: "Go to Communities", icon: Users, path: "/communities", group: "Navigation" },
  { id: "highlights", label: "Go to Highlights", icon: Bookmark, path: "/highlights", group: "Navigation" },
  { id: "games", label: "Go to Games", icon: LayoutGrid, path: "/games", group: "Navigation" },
  { id: "profile", label: "Go to Profile", icon: User, path: "/me", group: "Navigation" },
  { id: "settings", label: "Go to Settings", icon: Settings, path: "/settings", group: "Navigation" },
  { id: "courses", label: "Open Courses", icon: BookOpen, path: "/courses", group: "Academic" },
  { id: "assignments", label: "Open Assignments", icon: ClipboardList, path: "/assignments", group: "Academic" },
  { id: "notes", label: "Open Notes", icon: FileText, path: "/notes", group: "Academic" },
  { id: "bud", label: "Open Bud", icon: Sparkles, path: "/bud", group: "AI" },
];

/**
 * CommandPalette — Cmd+K / Ctrl+K universal search.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 */
export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()) || c.group.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const execute = useCallback((cmd) => {
    if (cmd.path) navigate(cmd.path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) execute(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [filtered, selectedIndex, execute, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="relative w-full max-w-[560px] crystal-card rounded-[18px] overflow-hidden shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-2.5 h-12 px-4 border-b border-border/40">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search UNIBUD..."
                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="text-[9px] font-bold text-muted-foreground px-1.5 py-0.5 rounded glass">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto no-scrollbar p-1.5">
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-[13px] text-muted-foreground">No results for "{query}"</p>
                </div>
              ) : (
                filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  const active = i === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onMouseEnter={() => setSelectedIndex(i)}
                      onClick={() => execute(cmd)}
                      className={cn(
                        "w-full flex items-center gap-2.5 h-9 px-2.5 rounded-[10px] spring-tap text-left",
                        active ? "glass" : ""
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")} strokeWidth={2.2} />
                      <span className="text-[12px] font-medium text-foreground flex-1">{cmd.label}</span>
                      <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">{cmd.group}</span>
                      {active && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}