import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, AlertTriangle, Shield, Package, Layers, Database, Globe, Eye, Snowflake, ChevronRight, Activity,
} from "lucide-react";
import { runConsolidationAudit } from "@/lib/os/consolidationValidator";
import ScreenHeader from "@/components/layout/ScreenHeader";

/**
 * ConsolidationDashboard — Phase 2 Shared Module Consolidation audit.
 *
 * Visualizes the seven audit dimensions that guarantee the frozen OS has:
 *   • Every module exactly once (no duplicates)
 *   • Every experience consuming from the registry
 *   • No duplicated implementations, entities, APIs, or realtime subscriptions
 *   • Every entity with realtime registration
 *   • Every experience depending on Platform Core
 *   • No direct provider calls from experiences
 *   • No demo/mock/placeholder data anywhere
 *
 * Accessible only through Operations (OracleWorkspaceGuard).
 */
export default function ConsolidationDashboard() {
  const audit = useMemo(() => runConsolidationAudit(), []);
  const { summary, audits, hierarchy } = audit;

  const auditCards = [
    {
      key: "moduleCompleteness",
      title: "Module Completeness",
      icon: Package,
      desc: "Every required social, academic, and communication module is registered",
      data: audits.moduleCompleteness,
      stats: [
        { label: "Required", value: summary.requiredModules },
        { label: "Registered", value: summary.registeredModules },
        { label: "Missing", value: summary.missingModules, warn: true },
      ],
    },
    {
      key: "moduleUniqueness",
      title: "Module Uniqueness",
      icon: Layers,
      desc: "No module ID is registered more than once",
      data: audits.moduleUniqueness,
      stats: [
        { label: "Total", value: summary.totalModules },
        { label: "Duplicates", value: summary.duplicateModules, warn: true },
      ],
    },
    {
      key: "entityCoverage",
      title: "Entity Realtime Coverage",
      icon: Database,
      desc: "Every entity with a module is registered in the Realtime sync registry",
      data: audits.entityCoverage,
      stats: [
        { label: "With Modules", value: audits.entityCoverage.totalEntitiesWithModules },
        { label: "Synced", value: audits.entityCoverage.syncedCount },
        { label: "Unsynced", value: summary.unsyncedEntities, warn: true },
      ],
    },
    {
      key: "platformCore",
      title: "Platform Core Adoption",
      icon: Shield,
      desc: "Every experience depends on Platform Core (Bud, Orbit, Spark, Realtime)",
      data: audits.platformCore,
      stats: [
        { label: "Experiences", value: summary.totalExperiences },
        { label: "Services", value: summary.platformCoreServices },
      ],
    },
    {
      key: "externalIntegrations",
      title: "External Integration Compliance",
      icon: Globe,
      desc: "No experience makes direct provider calls — all flow through Platform Core → Integrator",
      data: audits.externalIntegrations,
      stats: [
        { label: "Experiences", value: summary.totalExperiences },
        { label: "Violations", value: summary.providerCallViolations, warn: true },
      ],
    },
    {
      key: "zeroDemo",
      title: "Zero Demo Compliance",
      icon: Eye,
      desc: "No mock data, placeholder cards, fake analytics, or demo metrics",
      data: audits.zeroDemo,
      stats: [
        { label: "Modules", value: summary.totalModules },
        { label: "Violations", value: summary.zeroDemoViolations, warn: true },
      ],
    },
    {
      key: "experienceFreeze",
      title: "Experience Runtime Freeze",
      icon: Snowflake,
      desc: "Runtime is frozen — no new experiences may be created",
      data: audits.experienceFreeze,
      stats: [
        { label: "Frozen", value: audits.experienceFreeze.frozenCount },
        { label: "Registered", value: audits.experienceFreeze.registeredCount },
        { label: "Unauthorized", value: audits.experienceFreeze.extraExperiences.length, warn: true },
      ],
    },
  ];

  const hierarchyLevels = [
    hierarchy.level1, hierarchy.level2, hierarchy.level3, hierarchy.level4,
    hierarchy.level5, hierarchy.level6, hierarchy.level7, hierarchy.level8,
    hierarchy.level9, hierarchy.level10,
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      <ScreenHeader
        title="Consolidation Audit"
        subtitle="Phase 2 — Shared Module Consolidation"
        backTo="/admin"
      />

      <div className="max-w-[960px] mx-auto px-4 pt-4 space-y-6">
        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`crystal-card p-5 ${audit.valid ? "border-success/30" : "border-destructive/30"}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${audit.valid ? "bg-success/10" : "bg-destructive/10"}`}>
              {audit.valid ? (
                <CheckCircle2 className="w-6 h-6 text-success" strokeWidth={2.2} />
              ) : (
                <AlertTriangle className="w-6 h-6 text-destructive" strokeWidth={2.2} />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-foreground">
                {audit.valid ? "Architecture Consolidated" : "Consolidation In Progress"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {audit.valid
                  ? "All seven audit dimensions pass. The OS hierarchy is stable."
                  : `${audit.audits.moduleCompleteness.missingCount + audit.audits.moduleUniqueness.duplicateIds.length + audit.audits.entityCoverage.unsyncedEntities.length + audit.audits.zeroDemo.violations.length + audit.audits.externalIntegrations.violations.length + audit.audits.experienceFreeze.extraExperiences.length} issues remaining across seven audit dimensions.`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-bold tabular-nums text-foreground">
                {auditCards.filter((c) => c.data.valid).length}/{auditCards.length}
              </div>
              <div className="text-[10px] text-muted-foreground">Audits Passed</div>
            </div>
          </div>
        </motion.div>

        {/* Audit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {auditCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`crystal-card p-4 ${card.data.valid ? "border-success/20" : "border-warning/30"}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.data.valid ? "bg-success/10" : "bg-warning/10"}`}>
                    <Icon className={`w-4 h-4 ${card.data.valid ? "text-success" : "text-warning"}`} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-foreground">{card.title}</h3>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{card.desc}</p>
                  </div>
                  {card.data.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" strokeWidth={2.2} />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0" strokeWidth={2.2} />
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mb-2">
                  {card.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <span className={`text-[16px] font-bold tabular-nums ${stat.warn && stat.value > 0 ? "text-destructive" : "text-foreground"}`}>
                        {stat.value}
                      </span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Errors */}
                {card.data.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {card.data.errors.slice(0, 3).map((err, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <XCircle className="w-3 h-3 text-destructive shrink-0 mt-0.5" strokeWidth={2} />
                        <span className="text-[10px] text-muted-foreground leading-snug">{err}</span>
                      </div>
                    ))}
                    {card.data.errors.length > 3 && (
                      <span className="text-[10px] text-muted-foreground italic">+{card.data.errors.length - 3} more</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Module Catalog — Social */}
        <ModuleCatalogSection
          title="Social Modules"
          modules={audits.moduleCompleteness.results.social}
        />

        {/* Module Catalog — Academic */}
        <ModuleCatalogSection
          title="Academic Modules"
          modules={audits.moduleCompleteness.results.academic}
        />

        {/* Module Catalog — Communication */}
        <ModuleCatalogSection
          title="Communication Modules"
          modules={audits.moduleCompleteness.results.communication}
        />

        {/* Platform Core Services */}
        <div className="crystal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Platform Core Services</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {summary.platformCoreServices} services · Every experience must depend on these
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {[
              "Bud", "Orbit", "Spark", "Identity", "Authentication",
              "Search", "Recommendation", "Media", "Notification", "Analytics",
              "Storage", "Sync", "Permissions", "Realtime",
            ].map((svc) => (
              <div key={svc} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted/40">
                <CheckCircle2 className="w-3 h-3 text-success shrink-0" strokeWidth={2.2} />
                <span className="text-[10px] font-medium text-foreground truncate">{svc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Flow */}
        <div className="crystal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Integration Flow</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">No exceptions</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["Experience", "Platform Core", "Integrator", "Google", "Microsoft", "Spotify", "Apple", "Maps", "University APIs", "OCR", "Translation", "Weather"].map((node, i, arr) => (
              <React.Fragment key={node}>
                <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${i <= 2 ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"}`}>
                  {node}
                </span>
                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" strokeWidth={2} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stable Hierarchy */}
        <div className="crystal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Stable Hierarchy</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">The final architecture</span>
          </div>
          <div className="space-y-1">
            {hierarchyLevels.map((level, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] font-bold tabular-nums text-muted-foreground w-5">L{i + 1}</span>
                <span className={`text-[11px] font-medium ${i === 6 ? "text-primary font-bold" : "text-foreground"}`}>
                  {level}
                </span>
                {i === 6 && (
                  <div className="flex items-center gap-1 ml-2">
                    {hierarchy.experiences.map((exp) => (
                      <span key={exp} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              From here, development changes from building architecture to adding capabilities.
              Every new feature fits into one of the existing layers instead of introducing
              new architectural concepts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCatalogSection({ title, modules }) {
  const registered = modules.filter((m) => m.registered).length;
  const total = modules.length;
  const allRegistered = registered === total;

  return (
    <div className={`crystal-card p-4 ${allRegistered ? "border-success/20" : "border-warning/30"}`}>
      <div className="flex items-center gap-2 mb-3">
        {allRegistered ? (
          <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2.2} />
        ) : (
          <AlertTriangle className="w-4 h-4 text-warning" strokeWidth={2.2} />
        )}
        <h3 className="text-[14px] font-bold text-foreground">{title}</h3>
        <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
          {registered}/{total} registered
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${
              mod.registered ? "bg-success/5" : "bg-destructive/5"
            }`}
          >
            {mod.registered ? (
              <CheckCircle2 className="w-3 h-3 text-success shrink-0" strokeWidth={2.2} />
            ) : (
              <XCircle className="w-3 h-3 text-destructive shrink-0" strokeWidth={2.2} />
            )}
            <div className="min-w-0">
              <span className={`text-[10px] font-medium block ${mod.registered ? "text-foreground" : "text-destructive"}`}>
                {mod.label}
              </span>
              {mod.entity && (
                <span className="text-[8px] text-muted-foreground truncate block">{mod.entity}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}