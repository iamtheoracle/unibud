import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Circle, AlertTriangle, Shield,
  Zap, Radio, TrendingUp, Layers, Package, GraduationCap,
} from "lucide-react";
import { getMigrationReport } from "@/lib/os/migrationTracker";
import { useRealtimeEngine } from "@/lib/realtime/useRealtimeChannel";
import ScreenHeader from "@/components/layout/ScreenHeader";

/**
 * MigrationDashboard — internal dashboard tracking the Phase 5 experience
 * migration from legacy architecture to the v4 Experience Runtime.
 *
 * Shows: experience completion, migrated modules, remaining legacy components,
 * duplicate modules, constitutional violations, realtime health, and Platform Core
 * dependency usage.
 *
 * Accessible only through Operations (OracleWorkspaceGuard).
 */
export default function MigrationDashboard() {
  const report = useMemo(() => getMigrationReport(), []);
  const realtime = useRealtimeEngine();
  const [selectedExp, setSelectedExp] = useState(null);

  const statusIcon = {
    migrated: <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2.2} />,
    "in-progress": <Clock className="w-4 h-4 text-warning" strokeWidth={2.2} />,
    pending: <Circle className="w-4 h-4 text-muted-foreground" strokeWidth={2} />,
  };

  const statusColor = {
    migrated: "text-success",
    "in-progress": "text-warning",
    pending: "text-muted-foreground",
  };

  return (
    <div className="w-full max-w-[700px] mx-auto px-4 pt-6 pb-36 safe-area-pt">
      <ScreenHeader title="Migration Dashboard" backTo="/admin" />
      <div className="mt-4 space-y-5">
        {/* Overall Progress */}
        <div className="crystal-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[18px] font-bold text-foreground">Overall Migration</h2>
              <p className="text-[12px] text-muted-foreground">Phase 5 — Experience Runtime</p>
            </div>
            <div className="text-right">
              <span className="text-[32px] font-bold text-primary tabular-nums">{report.overall.percentage}%</span>
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${report.overall.percentage}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-chocolate"
            />
          </div>
          <div className="flex gap-4 mt-3">
            <StatusBadge label="Migrated" value={report.overall.migrated} color="text-success" />
            <StatusBadge label="In Progress" value={report.overall.inProgress} color="text-warning" />
            <StatusBadge label="Pending" value={report.overall.pending} color="text-muted-foreground" />
          </div>
        </div>

        {/* Campus Migration — Reference Implementation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Campus Migration</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">Reference Implementation</span>
          </div>
          <div className={`crystal-card p-4 ${report.campus.migrated ? "border-success/30" : "border-warning/30"}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className={`text-[20px] font-bold ${report.campus.migrated ? "text-success" : "text-warning"}`}>
                  {report.campus.migrated ? "MIGRATED" : "IN PROGRESS"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {report.campus.academicModuleCount} academic modules · {report.campus.modulesConsumed.length} total consumed
                </p>
              </div>
              <div className="text-right">
                <span className="text-[20px] font-bold text-foreground tabular-nums">
                  {report.campus.legacyRemaining === 0 ? "100" : Math.round((1 - report.campus.legacyRemaining / Math.max(report.campus.legacyRemaining, 1)) * 100)}%
                </span>
                <p className="text-[9px] text-muted-foreground">complete</p>
              </div>
            </div>

            {/* Platform Core Adoption */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {Object.entries(report.campus.platformCoreAdoption).map(([key, adopted]) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  {adopted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" strokeWidth={2.2} />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
                  )}
                  <span className="text-[8px] text-muted-foreground text-center capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </div>
              ))}
            </div>

            {/* Hook Status */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Hooks:</span>
              {["bud", "orbit", "spark", "realtime"].map((h) => (
                <span key={h} className={`text-[9px] px-1.5 py-0.5 rounded-md ${report.campus.hooks[h] ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {h}
                </span>
              ))}
            </div>

            {/* Constitutional Compliance */}
            <div className="flex items-center gap-1.5 mt-2">
              <Shield className={`w-3 h-3 ${report.campus.constitutional.valid ? "text-success" : "text-destructive"}`} strokeWidth={2.2} />
              <span className={`text-[10px] font-bold ${report.campus.constitutional.valid ? "text-success" : "text-destructive"}`}>
                {report.campus.constitutional.valid ? "Constitutionally Compliant" : "Violations Detected"}
              </span>
            </div>

            {/* Legacy Components */}
            {report.campus.legacyComponents.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Legacy Components:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {report.campus.legacyComponents.map((c) => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-md bg-warning/10 text-warning">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Square Migration — Canonical Social Implementation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Square Migration</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">Canonical Social Implementation</span>
          </div>
          <div className={`crystal-card p-4 ${report.square?.migrated ? "border-success/30" : "border-warning/30"}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className={`text-[20px] font-bold ${report.square?.migrated ? "text-success" : "text-warning"}`}>
                  {report.square?.migrated ? "MIGRATED" : "IN PROGRESS"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {report.square?.socialModuleCount || 0} social modules · {report.square?.modulesConsumed?.length || 0} total consumed
                </p>
              </div>
              <div className="text-right">
                <span className="text-[20px] font-bold text-foreground tabular-nums">
                  {report.square?.legacyRemaining === 0 ? "100" : Math.round((1 - report.square.legacyRemaining / Math.max(report.square.legacyRemaining, 1)) * 100)}%
                </span>
                <p className="text-[9px] text-muted-foreground">complete</p>
              </div>
            </div>

            {/* Platform Core Adoption */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {Object.entries(report.square?.platformCoreAdoption || {}).map(([key, adopted]) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  {adopted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" strokeWidth={2.2} />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
                  )}
                  <span className="text-[8px] text-muted-foreground text-center capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </div>
              ))}
            </div>

            {/* Hook Status */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Hooks:</span>
              {["bud", "orbit", "spark", "realtime"].map((h) => (
                <span key={h} className={`text-[9px] px-1.5 py-0.5 rounded-md ${report.square?.hooks[h] ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {h}
                </span>
              ))}
            </div>

            {/* Constitutional Compliance */}
            <div className="flex items-center gap-1.5 mt-2">
              <Shield className={`w-3 h-3 ${report.square?.constitutional?.valid ? "text-success" : "text-destructive"}`} strokeWidth={2.2} />
              <span className={`text-[10px] font-bold ${report.square?.constitutional?.valid ? "text-success" : "text-destructive"}`}>
                {report.square?.constitutional?.valid ? "Constitutionally Compliant" : "Violations Detected"}
              </span>
            </div>

            {/* Duplicate Social Modules */}
            {report.duplicateSocialModules?.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-bold text-destructive uppercase">Duplicate Social Modules:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {report.duplicateSocialModules.map((c) => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy Components */}
            {report.square?.legacyComponents?.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Legacy Components:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {report.square.legacyComponents.map((c) => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-md bg-warning/10 text-warning">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connect Migration — Canonical Communication Implementation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Connect Migration</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">Canonical Communication Implementation</span>
          </div>
          <div className={`crystal-card p-4 ${report.connect?.migrated ? "border-success/30" : "border-warning/30"}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className={`text-[20px] font-bold ${report.connect?.migrated ? "text-success" : "text-warning"}`}>
                  {report.connect?.migrated ? "MIGRATED" : "IN PROGRESS"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {report.connect?.communicationModuleCount || 0} communication modules · {report.connect?.modulesConsumed?.length || 0} total consumed
                </p>
              </div>
              <div className="text-right">
                <span className="text-[20px] font-bold text-foreground tabular-nums">
                  {report.connect?.legacyRemaining === 0 ? "100" : Math.round((1 - report.connect.legacyRemaining / Math.max(report.connect.legacyRemaining, 1)) * 100)}%
                </span>
                <p className="text-[9px] text-muted-foreground">complete</p>
              </div>
            </div>

            {/* Platform Core Adoption */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {Object.entries(report.connect?.platformCoreAdoption || {}).map(([key, adopted]) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  {adopted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" strokeWidth={2.2} />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
                  )}
                  <span className="text-[8px] text-muted-foreground text-center capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </div>
              ))}
            </div>

            {/* Hook Status */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Hooks:</span>
              {["bud", "orbit", "spark", "realtime"].map((h) => (
                <span key={h} className={`text-[9px] px-1.5 py-0.5 rounded-md ${report.connect?.hooks[h] ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {h}
                </span>
              ))}
            </div>

            {/* Constitutional Compliance */}
            <div className="flex items-center gap-1.5 mt-2">
              <Shield className={`w-3 h-3 ${report.connect?.constitutional?.valid ? "text-success" : "text-destructive"}`} strokeWidth={2.2} />
              <span className={`text-[10px] font-bold ${report.connect?.constitutional?.valid ? "text-success" : "text-destructive"}`}>
                {report.connect?.constitutional?.valid ? "Constitutionally Compliant" : "Violations Detected"}
              </span>
            </div>

            {/* Duplicate Communication Modules */}
            {report.duplicateCommunicationModules?.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-bold text-destructive uppercase">Duplicate Communication Modules:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {report.duplicateCommunicationModules.map((c) => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy Components */}
            {report.connect?.legacyComponents?.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Legacy Components:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {report.connect.legacyComponents.map((c) => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-md bg-warning/10 text-warning">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remaining Experiences — Quad, Lens, Services, Me (Phases 9-12) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Remaining Experiences</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">Phases 9-12 · Composing Platform Core</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "quad", label: "Quad", phase: "Phase 9", desc: "Discovery" },
              { key: "lens", label: "Lens", phase: "Phase 10", desc: "Command Center" },
              { key: "services", label: "Services", phase: "Phase 11", desc: "Services Gateway" },
              { key: "me", label: "Me", phase: "Phase 12", desc: "Operating Profile" },
            ].map((exp) => {
              const data = report[exp.key];
              return (
                <div key={exp.key} className={`crystal-card p-3 ${data?.migrated ? "border-success/30" : "border-warning/30"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-bold text-foreground">{exp.label}</span>
                    {data?.migrated ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" strokeWidth={2.2} />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-warning" strokeWidth={2.2} />
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2">{exp.phase} · {exp.desc}</p>
                  <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-[8px] text-muted-foreground">Modules:</span>
                    <span className="text-[9px] font-bold text-foreground tabular-nums">{data?.moduleCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-[8px] text-muted-foreground">Hooks:</span>
                    {["bud", "orbit", "spark", "realtime"].map((h) => (
                      <span key={h} className={`text-[7px] px-1 py-0.5 rounded ${data?.hooks[h] ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{h}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className={`w-2.5 h-2.5 ${data?.constitutional?.valid ? "text-success" : "text-destructive"}`} strokeWidth={2.2} />
                    <span className={`text-[8px] font-bold ${data?.constitutional?.valid ? "text-success" : "text-destructive"}`}>
                      {data?.constitutional?.valid ? "Compliant" : "Violations"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience Runtime Freeze Status */}
        {report.experienceRuntimeFrozen && (
          <div className="crystal-card p-3 border-success/30">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" strokeWidth={2.2} />
              <div className="flex-1">
                <span className="text-[13px] font-bold text-success">Experience Runtime Frozen</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  All seven experiences migrated. No new experiences may be created.
                  Future features must be Shared Modules, Platform Core Services,
                  External Integrations, or enhancements to existing experiences.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Academic Modules */}
        <div>
          <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" strokeWidth={2.2} />
            Duplicate Academic Modules
          </h3>
          <div className={`crystal-card p-4 ${report.duplicateModules?.length === 0 ? "border-success/30" : "border-destructive/30"}`}>
            {(!report.duplicateModules || report.duplicateModules.length === 0) ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2.2} />
                <span className="text-[12px] text-muted-foreground">No duplicate academic modules detected.</span>
              </div>
            ) : (
              <div className="space-y-1">
                {report.duplicateModules?.map((mod) => (
                  <div key={mod} className="flex items-center gap-1.5 text-[11px] text-destructive">
                    <AlertTriangle className="w-3 h-3" strokeWidth={2.2} />
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Realtime Entity Coverage */}
        <div>
          <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" strokeWidth={2.2} />
            Realtime Entity Coverage
          </h3>
          <div className={`crystal-card p-4 ${report.realtimeCoverage?.coverage === 100 ? "border-success/30" : "border-warning/30"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[20px] font-bold text-foreground tabular-nums">{report.realtimeCoverage?.coverage || 0}%</span>
              <span className="text-[10px] text-muted-foreground">
                {report.realtimeCoverage?.synced || 0} / {report.realtimeCoverage?.total || 0} entities synced
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${report.realtimeCoverage?.coverage || 0}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-chocolate"
              />
            </div>
            {report.realtimeCoverage?.unsynced?.length > 0 && (
              <div className="mt-2 space-y-1">
                {report.realtimeCoverage.unsynced.map((entity) => (
                  <div key={entity} className="flex items-center gap-1.5 text-[11px] text-warning">
                    <AlertTriangle className="w-3 h-3" strokeWidth={2.2} />
                    <span>{entity} — not in Realtime Engine</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Constitutional Status */}
        <div className={`crystal-card p-4 ${report.constitutional.valid ? "border-success/30" : "border-destructive/30"}`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-4 h-4 ${report.constitutional.valid ? "text-success" : "text-destructive"}`} strokeWidth={2.2} />
            <span className="text-[14px] font-bold text-foreground">Constitutional Validator</span>
            <span className={`text-[11px] font-bold ml-auto ${report.constitutional.valid ? "text-success" : "text-destructive"}`}>
              {report.constitutional.valid ? "COMPLIANT" : "VIOLATIONS"}
            </span>
          </div>
          {report.constitutional.errors.length > 0 && (
            <div className="space-y-1 mt-2">
              {report.constitutional.errors.slice(0, 5).map((err, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-destructive">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
          {report.constitutional.valid && (
            <p className="text-[11px] text-muted-foreground mt-1">All experiences comply with the five constitutions.</p>
          )}
        </div>

        {/* Experience Cards */}
        <div>
          <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" strokeWidth={2.2} />
            Experiences
          </h3>
          <div className="space-y-2">
            {report.experiences.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setSelectedExp(selectedExp === exp.id ? null : exp.id)}
                className="w-full crystal-card p-3.5 text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3">
                  {statusIcon[exp.status]}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground capitalize">{exp.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {exp.modules.length} modules · {exp.legacyComponents.length} legacy
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${statusColor[exp.status]}`}>{exp.status}</span>
                </div>

                {selectedExp === exp.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 pt-3 border-t border-border/40 space-y-2"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Consumed Modules</p>
                      <div className="flex flex-wrap gap-1">
                        {exp.modules.map((m) => (
                          <span key={m} className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{m}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Legacy Components</p>
                      <div className="flex flex-wrap gap-1">
                        {exp.legacyComponents.map((c) => (
                          <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Platform Core Hooks:</p>
                      {["bud", "orbit", "spark", "realtime"].map((h) => (
                        <span key={h} className={`text-[9px] px-1.5 py-0.5 rounded-md ${exp.hooks[h] ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {h}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Module Consumption */}
        <div>
          <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" strokeWidth={2.2} />
            Shared Module Consumption
          </h3>
          <div className="crystal-card p-3 space-y-1.5">
            {report.moduleConsumption
              .sort((a, b) => b.consumerCount - a.consumerCount)
              .slice(0, 8)
              .map((m) => (
                <div key={m.moduleId} className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground">{m.moduleId}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{m.consumers.join(", ")}</span>
                    {m.isRegistered ? (
                      <CheckCircle2 className="w-3 h-3 text-success" strokeWidth={2.2} />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-destructive" strokeWidth={2.2} />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Platform Core Usage */}
        <div>
          <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" strokeWidth={2.2} />
            Platform Core Usage
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <CoreUsageCard label="Bud" value={report.platformCore.hooks.bud} total={report.platformCore.totalExperiences} />
            <CoreUsageCard label="Orbit" value={report.platformCore.hooks.orbit} total={report.platformCore.totalExperiences} />
            <CoreUsageCard label="Spark" value={report.platformCore.hooks.spark} total={report.platformCore.totalExperiences} />
            <CoreUsageCard label="Realtime" value={report.platformCore.hooks.realtime} total={report.platformCore.totalExperiences} />
            <CoreUsageCard label="Context" value={report.platformCore.contextProvider} total={report.platformCore.totalExperiences} />
            <CoreUsageCard label="Search" value={report.platformCore.search} total={report.platformCore.totalExperiences} />
          </div>
        </div>

        {/* Realtime Health */}
        <div>
          <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" strokeWidth={2.2} />
            Realtime Engine Health
          </h3>
          <div className="crystal-card p-4 grid grid-cols-3 gap-3">
            <Metric label="Subscriptions" value={realtime.activeSubscriptions} />
            <Metric label="Total Events" value={realtime.totalEvents} />
            <Metric label="Batches" value={realtime.batchesFlushed} />
            <Metric label="Avg Latency" value={realtime.avgLatency > 0 ? `${realtime.avgLatency}ms` : "—"} />
            <Metric label="Dropped" value={realtime.droppedEvents} warning={realtime.droppedEvents > 0} />
            <Metric label="Reconnects" value={realtime.reconnectCount} />
          </div>
        </div>

        {/* Registry Summary */}
        <div className="crystal-card p-4">
          <h3 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" strokeWidth={2.2} />
            Registry Summary
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Experiences" value={report.experiencesRegistered} />
            <Metric label="Modules" value={report.modules.total} />
            <Metric label="Services" value={report.services} />
            <Metric label="Academic" value={report.modules.byCategory.academic || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[16px] font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function CoreUsageCard({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="crystal-card p-3">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[16px] font-bold text-foreground tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground">/ {total}</span>
      </div>
      <div className="h-1 rounded-full bg-muted mt-1.5 overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Metric({ label, value, warning }) {
  return (
    <div className="text-center">
      <span className={`text-[16px] font-bold tabular-nums ${warning ? "text-destructive" : "text-foreground"}`}>{value}</span>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}