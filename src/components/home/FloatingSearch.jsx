import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, BookOpen, Award, Calendar, ShoppingBag, Briefcase, Users,
  FlaskConical, ClipboardList, UserSearch, Sparkles, MessageSquare, Search, ArrowRight,
} from "lucide-react";
import { resolveSearchIntent } from "@/lib/intelligence/searchIntent";

const EASE = [0.16, 1, 0.3, 1];
const CHIPS = ["Courses", "Notes", "Assignments", "Scholarships", "Study Groups", "Bud"];

const ICONS = {
  Building2, BookOpen, Award, Calendar, ShoppingBag, Briefcase, Users,
  FlaskConical, ClipboardList, UserSearch, Sparkles, MessageSquare, Search,
};

/**
 * FloatingSearch — the universal home search. Spark resolves intent across
 * universities, courses/faculties and content categories, so "Comp Sci",
 * "UNIBEN" or "Scholarships" route straight to the right place instantly.
 */
export default function FloatingSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);

  const { interpretations } = useMemo(() => resolveSearchIntent(q), [q]);
  const showResults = focus && q.trim().length > 0;

  const go = (route) => {
    setFocus(false);
    setQ("");
    navigate(route);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center h-[52px] px-4 rounded-2xl glass-strong">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          type="text"
          placeholder="What would you like to learn today?"
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0 ml-2.5"
        />
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="mt-2 rounded-2xl glass-strong overflow-hidden"
          >
            {interpretations.map((it, i) => {
              const Icon = ICONS[it.icon] || Search;
              return (
                <button
                  key={it.domain + i}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(it.route)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors spring-tap border-b border-border/20 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">{it.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{it.sub}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </motion.div>
        )}

        {!showResults && focus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mt-3">
              {CHIPS.map((c) => (
                <span key={c} className="px-3 py-1.5 rounded-full glass text-[11px] font-medium text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}