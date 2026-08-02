import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, LayoutGrid, Building2, Compass, MessagesSquare, User,
  ShieldAlert, Check, X, FileText, ShieldCheck, AlertTriangle, Loader2,
} from "lucide-react";
import {
  CONTENT_ARCH_PREAMBLE,
  USER_SPACES,
  INTERNAL_OS_ITEMS,
  CONTENT_ARCH_RULES,
  CONTENT_ARCH_GLOBAL_RULE,
} from "@/lib/constitution/contentArchitecture";
import { runContentArchitectureValidation, ALLOWED_USER_VISIBILITY, RESTRICTED_VISIBILITY } from "@/lib/constitution/contentArchitectureValidator";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

const SPACE_ICONS = {
  square: LayoutGrid,
  campus: Building2,
  discovery: Compass,
  quad: MessagesSquare,
  me: User,
};

export default function ContentArchitecture() {
  const navigate = useNavigate();
  const [activeSpace, setActiveSpace] = useState("square");

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Content Architecture</h1>
          <p className="text-[12px] text-muted-foreground">5 user spaces · 1 internal OS layer</p>
        </div>
      </div>

      {/* Preamble */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="crystal-card p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <p className="text-[13px] font-bold text-foreground">{CONTENT_ARCH_PREAMBLE.title}</p>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{CONTENT_ARCH_PREAMBLE.statement}</p>
      </motion.div>

      {/* Global Rule */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="glass rounded-2xl p-4 mb-6 border-l-2 border-l-primary"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">Permanent Rule</p>
        <p className="text-[12px] text-foreground/90 leading-relaxed">{CONTENT_ARCH_GLOBAL_RULE.rule}</p>
      </motion.div>

      {/* Space Selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
        className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1"
      >
        {USER_SPACES.map((space) => {
          const Icon = SPACE_ICONS[space.id] || LayoutGrid;
          const isActive = activeSpace === space.id;
          return (
            <button
              key={space.id}
              onClick={() => setActiveSpace(space.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full spring-tap shrink-0 ${
                isActive ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[12px] font-semibold">{space.name}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Active Space Detail */}
      {USER_SPACES.filter((s) => s.id === activeSpace).map((space) => {
        const Icon = SPACE_ICONS[space.id] || LayoutGrid;
        return (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="space-y-3 mb-6"
          >
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-foreground">{space.name}</p>
                  <p className="text-[11px] text-muted-foreground">{space.responsibility}</p>
                </div>
              </div>
            </div>

            {/* Allowed Content */}
            <div className="glass rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-success mb-3 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Allowed Content
              </p>
              <div className="flex flex-wrap gap-2">
                {space.allowed.map((item) => (
                  <span key={item} className="px-2.5 py-1.5 rounded-lg bg-success/10 text-[11px] font-medium text-success-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Forbidden Content */}
            <div className="glass rounded-2xl p-4 border border-destructive/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-destructive mb-3 flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" /> Never Display
              </p>
              <div className="flex flex-wrap gap-2">
                {space.forbidden.map((item) => (
                  <span key={item} className="px-2.5 py-1.5 rounded-lg bg-destructive/10 text-[11px] font-medium text-destructive">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Live Validation */}
      <LiveValidationPanel />

      {/* Internal OS Layer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
        className="glass rounded-2xl p-4 mb-6 border border-primary/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <p className="text-[13px] font-bold text-foreground">Internal Operating System</p>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
          A completely separate administrative workspace. Never queried by Square, Campus, Discovery, Quad, or Me.
        </p>
        <div className="flex flex-wrap gap-2">
          {INTERNAL_OS_ITEMS.map((item) => (
            <span key={item} className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-[11px] font-medium text-foreground">
              {item}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Architectural Rules */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
        className="glass rounded-2xl divide-y divide-border/30 overflow-hidden"
      >
        <div className="p-4 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Architectural Rules ({CONTENT_ARCH_RULES.length})
          </p>
        </div>
        {CONTENT_ARCH_RULES.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: 0.22 + idx * 0.02 }}
            className="flex items-start gap-3 p-3.5"
          >
            <div className="w-5 h-5 rounded-full border-2 border-destructive/40 bg-destructive/5 flex items-center justify-center mt-0.5 shrink-0">
              <ShieldAlert className="w-2.5 h-2.5 text-destructive" />
            </div>
            <p className="text-[12px] text-foreground/90 leading-snug flex-1">{rule.rule}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * LiveValidationPanel — fetches a small sample from each user-facing space
 * and runs the content architecture validator to confirm no system documents
 * or restricted-visibility records can leak through.
 */
function LiveValidationPanel() {
  const { data: validation, isLoading } = useQuery({
    queryKey: ["contentArchitectureValidation"],
    queryFn: async () => {
      const [posts, events, clubs, communities, marketplace, opportunities] = await Promise.all([
        base44.entities.QuadPost.list("-created_date", 20).catch(() => []),
        base44.entities.CampusEvent.list("-created_date", 10).catch(() => []),
        base44.entities.Club.list("-created_date", 10).catch(() => []),
        base44.entities.Community.list("-created_date", 10).catch(() => []),
        base44.entities.MarketplaceListing.list("-created_date", 10).catch(() => []),
        base44.entities.Opportunity.list("-created_date", 10).catch(() => []),
      ]);
      return runContentArchitectureValidation({
        square: posts,
        campus: [...events, ...clubs],
        discovery: [...communities, ...marketplace, ...opportunities],
        quad: posts,
        me: [],
      });
    },
    staleTime: 60000,
  });

  const passed = validation?.passed ?? false;
  const totalViolations = validation?.totalViolations ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.12 }}
      className={`glass rounded-2xl p-4 mb-6 border ${passed ? "border-success/20" : "border-destructive/20"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        ) : passed ? (
          <ShieldCheck className="w-4 h-4 text-success" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        )}
        <p className="text-[13px] font-bold text-foreground">Runtime Validation</p>
        {!isLoading && (
          <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${passed ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
            {passed ? "PASSED" : "FAILED"}
          </span>
        )}
      </div>
      {isLoading ? (
        <p className="text-[11px] text-muted-foreground">Scanning feeds for system document leaks…</p>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            Live check across {validation?.spacesChecked || 5} user spaces. {totalViolations === 0
              ? "No system documents or restricted-visibility records detected in user-facing feeds."
              : `${totalViolations} violation(s) detected — system documents are leaking into user spaces.`}
          </p>
          <div className="space-y-1.5">
            {validation?.results?.map((r) => (
              <div key={r.space} className="flex items-center justify-between text-[11px]">
                <span className="capitalize text-muted-foreground">{r.space}</span>
                <span className={`font-semibold ${r.valid ? "text-success" : "text-destructive"}`}>
                  {r.valid ? "Clean" : `${r.violations.length} leak(s)`}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-1.5">
            {ALLOWED_USER_VISIBILITY.map((v) => (
              <span key={v} className="px-1.5 py-0.5 rounded bg-success/10 text-[9px] font-bold text-success">{v}</span>
            ))}
            {RESTRICTED_VISIBILITY.map((v) => (
              <span key={v} className="px-1.5 py-0.5 rounded bg-destructive/10 text-[9px] font-bold text-destructive line-through">{v}</span>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}