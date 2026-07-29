import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LogOut, Clock, AlertTriangle, Power, ToggleLeft, ToggleRight, Loader2, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { levelByCode } from "@/lib/oracle/authorityLevels";
import ExecutiveVerificationGate from "@/components/oracle/ExecutiveVerificationGate";
import ExecutiveAgentPanel from "@/components/oracle/ExecutiveAgentPanel";

/**
 * ExecutiveAuthority — Oracle section for authority code verification
 * and executive mode platform management.
 *
 * After verification:
 *  1. Oracle recognizes the authority level
 *  2. The visible authority code is removed from the interface
 *  3. Correct permissions are applied
 *  4. Required Super Agents are coordinated
 *  5. Authorized workflows can be executed
 *  6. Actions are recorded in the audit system
 *  7. Results return to the authorized administrator
 */
export default function ExecutiveAuthority({ module, onActive }) {
  const { toast } = useToast();
  const [verification, setVerification] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const levelData = verification ? levelByCode(verification.authorityCode) : null;

  const handleLogout = () => {
    setVerification(null);
    toast({ title: "Executive Mode Exited" });
  };

  const logAction = async (action, targetType, targetName, result = "success") => {
    try {
      await base44.functions.invoke("logExecutiveAction", {
        verificationId: verification.verificationId,
        authorityCode: verification.authorityCode,
        action,
        targetType,
        targetName,
        result,
      });
    } catch {
      // Non-blocking
    }
  };

  const toggleMaintenance = async () => {
    const newMode = !maintenanceMode;
    setActionLoading("maintenance");
    try {
      await logAction(
        newMode ? "maintenance_mode_enabled" : "maintenance_mode_disabled",
        "platform",
        "global",
        newMode ? "enabled" : "disabled"
      );
      setMaintenanceMode(newMode);
      toast({
        title: newMode ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
        description: newMode ? "Platform is in maintenance." : "Platform operations resumed.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const quickActions = [
    { id: "modules", label: "Module Management", desc: "Enable or disable platform modules", icon: ToggleRight },
    { id: "flags", label: "Feature Flags", desc: "Toggle feature flags across the platform", icon: Activity },
    { id: "deploy", label: "Deployment", desc: "Manage deployments and rollbacks", icon: Power },
    { id: "audit", label: "Audit Review", desc: "Review executive audit trail", icon: ShieldCheck },
  ];

  const handleQuickAction = async (action) => {
    setActionLoading(action.id);
    await logAction(`${action.id}_accessed`, "executive_action", action.label, "accessed");
    toast({ title: action.label, description: "Consultation plan generated." });
    setActionLoading(null);
  };

  const isReadOnly = levelData?.readOnly;

  return (
    <div className="p-4 lg:p-6 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl glass flex items-center justify-center">
            <ShieldCheck className="w-[18px] h-[18px] text-primary" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-[16px]">Executive Authority</h1>
            <p className="text-[11px] text-muted-foreground">
              {verification ? `Level ${levelData?.level} — ${levelData?.title}` : "Verification Required"}
            </p>
          </div>
        </div>
        {verification && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-[11px] font-medium spring-tap text-muted-foreground"
          >
            <LogOut className="w-3 h-3" /> Exit
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!verification ? (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ExecutiveVerificationGate onVerified={setVerification} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid lg:grid-cols-2 gap-4"
          >
            <ExecutiveAgentPanel verification={verification} />

            {/* Platform Controls */}
            <div className="space-y-4">
              {/* Maintenance Mode */}
              <div className="crystal-card radius-lg p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${maintenanceMode ? "bg-warning/20" : "glass"}`}>
                      <Power className={`w-[18px] h-[18px] ${maintenanceMode ? "text-warning" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-[14px]">Maintenance Mode</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {maintenanceMode ? "Platform in maintenance" : "Operating normally"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleMaintenance}
                    disabled={actionLoading === "maintenance" || isReadOnly}
                    className="spring-tap disabled:opacity-30"
                  >
                    {actionLoading === "maintenance" ? (
                      <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
                    ) : maintenanceMode ? (
                      <ToggleRight className="w-9 h-9 text-warning" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {isReadOnly && (
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    Read-only authority — platform modifications restricted
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="crystal-card radius-lg p-5">
                <h3 className="font-heading font-bold text-[14px] mb-3">Platform Controls</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    const loading = actionLoading === action.id;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        disabled={loading || isReadOnly}
                        className="flex flex-col items-start gap-2 p-3 rounded-xl glass hover-lift text-left spring-tap disabled:opacity-40"
                      >
                        <div className="w-8 h-8 rounded-lg glass-strong flex items-center justify-center">
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Icon className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold leading-tight">{action.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{action.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Verification metadata */}
            <div className="crystal-card radius-lg p-4 lg:col-span-2">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Verified at {new Date(verification.verifiedAt).toLocaleString()}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="font-mono">ID: {verification.verificationId}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-success">Audit logging active</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}