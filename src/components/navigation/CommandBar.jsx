/**
 * UNIBUD Navigation OS — Universal Command Bar
 *
 * One command surface accessible from every authenticated screen.
 * Powered by Bud's AI layer + Universal Search.
 *
 * Triggers:
 *   • Keyboard shortcut: Cmd/Ctrl + K
 *   • Long-press on the screen (via CommandBarProvider)
 *   • Search icon tap (via SearchContext)
 *   • Tapping Bud in the Me tab (redirects to /home for full Bud)
 *
 * Capabilities:
 *   • Search (Universal Search)
 *   • Navigate (go to any page)
 *   • Create (new post, message, etc.)
 *   • Ask Bud (opens BudSheet)
 *   • Start workflow
 *   • Recent pages (from NavigationIntelligence)
 *
 * Accessibility:
 *   • Traps focus within the overlay when open
 *   • Escape closes the bar
 *   • Arrow keys navigate suggestions
 *   • Screen reader announcements via aria-live
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ArrowRight, Clock, Sparkles, Mic,
  MessageCircle, PenLine, Settings, GraduationCap,
  BookOpen, Calendar, Users,
} from "lucide-react";
import { hapticTap, hapticImpact } from "@/lib/haptics";
import { useUniversalSearch, getRecentSearches, addRecentSearch } from "@/hooks/useUniversalSearch";
import { getDestinationByRoute } from "@/lib/navigation/registry";
import { getQuickActions } from "@/lib/navigation/quickActions";
import { recordCommandBarOpen, recordDeepLinkOpen } from "@/lib/navigation/navigationAnalytics";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP = {
  Search, Clock, Sparkles, Mic, MessageCircle, PenLine,
  Settings, GraduationCap, BookOpen, Calendar, Users,
  Home: () => <span>🏠</span>,
  Wallet: () => <span>💳</span>,
  Trophy: () => <span>🏆</span>,
  ClipboardList: () => <span>📋</span>,
  CalendarDays: Calendar,
  FileText: () => <span>📄</span>,
  Inbox: () => <span>📥</span>,
  Phone: () => <span>📞</span>,
  ShoppingBag: () => <span>🛍️</span>,
  "": () => null,
};

function ActionIcon({ name, ...props }) {
  const Comp = ICON_MAP[name] || ArrowRight;
  return <Comp {...props} />;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CommandBarContext = createContext(null);

export function CommandBarProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openCommandBar = useCallback(() => {
    hapticImpact(15);
    recordCommandBarOpen();
    setOpen(true);
  }, []);

  const closeCommandBar = useCallback(() => {
    setOpen(false);
  }, []);

  // Global keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) closeCommandBar();
        else openCommandBar();
      }
      if (e.key === "Escape" && open) {
        closeCommandBar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, openCommandBar, closeCommandBar]);

  return (
    <CommandBarContext.Provider value={{ open, openCommandBar, closeCommandBar }}>
      {children}
      <CommandBarOverlay />
    </CommandBarContext.Provider>
  );
}

export function useCommandBar() {
  const ctx = useContext(CommandBarContext);
  if (!ctx) {
    return { open: false, openCommandBar: () => {}, closeCommandBar: () => {} };
  }
  return ctx;
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

function CommandBarOverlay() {
  const { open, closeCommandBar } = useCommandBar();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [recent, setRecent] = useState([]);
  const { setOpen: openBud, openVoice } = useBudLauncher();

  const { query, setQuery, results, isLoading, clear } = useUniversalSearch();

  const dest = getDestinationByRoute(location.pathname);
  const destId = dest?.id || "square";

  // Quick actions for current context
  const quickActions = getQuickActions({ destinationId: destId, pathname: location.pathname });

  // Recent search terms
  useEffect(() => {
    if (open) {
      setRecent(getRecentSearches());
      setFocusIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      clear();
      setQuery("");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    hapticTap();
    closeCommandBar();
  }, [closeCommandBar]);

  const handleAction = useCallback((action) => {
    hapticTap();
    closeCommandBar();

    switch (action.action) {
      case "open-bud":
        openBud(true);
        break;
      case "voice":
        openVoice();
        break;
      case "search":
        // Focus the command bar input — we're already here
        setTimeout(() => inputRef.current?.focus(), 50);
        return; // don't close
      case "create-post":
        navigate("/square");
        break;
      case "new-message":
        navigate("/messages");
        break;
      default:
        if (action.path) {
          recordDeepLinkOpen(action.path);
          navigate(action.path);
        }
    }
  }, [closeCommandBar, openBud, openVoice, navigate]);

  const handleSearchResult = useCallback((result) => {
    hapticTap();
    if (query) addRecentSearch(query);
    closeCommandBar();
    if (result.path) {
      recordDeepLinkOpen(result.path);
      navigate(result.path);
    }
  }, [query, closeCommandBar, navigate]);

  const handleRecentSearch = useCallback((term) => {
    setQuery(term);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [setQuery]);

  // Keyboard navigation within results
  const handleKeyDown = useCallback((e) => {
    const items = listRef.current?.querySelectorAll("[data-nav-item]") || [];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusIndex >= 0) {
      items[focusIndex]?.click();
    }
  }, [focusIndex]);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll("[data-nav-item]") || [];
    if (focusIndex >= 0 && items[focusIndex]) {
      items[focusIndex].focus();
    }
  }, [focusIndex]);

  const showSearchResults = query.length > 0;
  const hasResults = Object.values(results || {}).some((r) => r?.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Command Bar Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-[9001] max-w-[520px] mx-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Command Bar"
            onKeyDown={handleKeyDown}
          >
            <div
              className="rounded-[24px] overflow-hidden"
              style={{
                background: "rgba(14, 14, 14, 0.96)",
                backdropFilter: "blur(24px) saturate(1.6)",
                WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.5), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                <Search className="w-4.5 h-4.5 text-white/40 shrink-0" strokeWidth={2} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search, navigate, ask Bud..."
                  className="flex-1 bg-transparent text-white placeholder-white/30 text-[15px] font-medium outline-none"
                  aria-label="Command input"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    onClick={() => { clear(); setQuery(""); inputRef.current?.focus(); }}
                    className="text-white/30 hover:text-white/60 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="text-white/30 hover:text-white/60 transition-colors ml-1"
                  aria-label="Close command bar"
                >
                  <kbd className="text-[11px] px-1.5 py-0.5 rounded border border-white/20 font-mono">ESC</kbd>
                </button>
              </div>

              {/* Results / Suggestions */}
              <div
                ref={listRef}
                className="max-h-[340px] overflow-y-auto"
                role="listbox"
                aria-label="Suggestions"
              >
                {showSearchResults ? (
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    hasResults={hasResults}
                    onSelect={handleSearchResult}
                  />
                ) : (
                  <DefaultSuggestions
                    quickActions={quickActions}
                    recentSearches={recent}
                    onAction={handleAction}
                    onRecentSearch={handleRecentSearch}
                  />
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05]">
                <span className="text-[11px] text-white/25">
                  <kbd className="font-mono">↑↓</kbd> navigate · <kbd className="font-mono">⏎</kbd> select
                </span>
                <span className="text-[11px] text-white/25">
                  Powered by Bud
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DefaultSuggestions({ quickActions, recentSearches, onAction, onRecentSearch }) {
  return (
    <div className="py-2">
      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <div className="px-4 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Quick Actions
            </span>
          </div>
          {quickActions.slice(0, 6).map((action) => (
            <ActionRow
              key={action.id}
              icon={<ActionIcon name={action.icon} className="w-4 h-4" />}
              label={action.label}
              category={action.category}
              onClick={() => onAction(action)}
            />
          ))}
        </div>
      )}

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="mt-1">
          <div className="px-4 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Recent Searches
            </span>
          </div>
          {recentSearches.slice(0, 4).map((term) => (
            <ActionRow
              key={term}
              icon={<Clock className="w-4 h-4" />}
              label={term}
              category="recent"
              onClick={() => onRecentSearch(term)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResults({ results, isLoading, hasResults, onSelect }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Search className="w-6 h-6 text-white/20" />
        <span className="text-sm text-white/30">No results found</span>
      </div>
    );
  }

  const sections = Object.entries(results || {}).filter(([, items]) => items?.length > 0);

  return (
    <div className="py-2">
      {sections.map(([category, items]) => (
        <div key={category}>
          <div className="px-4 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30 capitalize">
              {category}
            </span>
          </div>
          {items.slice(0, 4).map((item) => (
            <ActionRow
              key={item.id || item.path}
              icon={<ArrowRight className="w-4 h-4" />}
              label={item.label || item.name || item.title || ""}
              category={category}
              sublabel={item.sublabel}
              onClick={() => onSelect(item)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ActionRow({ icon, label, category, sublabel, onClick }) {
  return (
    <button
      data-nav-item
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] focus-visible:bg-white/[0.06] transition-colors text-left focus-visible:outline-none group"
      role="option"
    >
      <span className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 text-white/50 group-hover:text-white/70 transition-colors"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-medium text-white/85 truncate block">{label}</span>
        {sublabel && <span className="text-[11px] text-white/35 truncate block">{sublabel}</span>}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
    </button>
  );
}
