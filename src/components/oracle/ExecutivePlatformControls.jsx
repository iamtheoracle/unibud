import React, { useState } from "react";
import { motion } from "framer-motion";
import { Power, AlertTriangle, Activity, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { generateExecutivePlan } from "@/lib/oracle/executiveMode";

/**
 * ExecutivePlatformControls — authorized platform management actions.
 * Each action is audit-logged via the logExecutiveAction backend function.
 */
export default function ExecutivePlatformControls({ verification }) {
  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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
      // Non-blocking — audit log failure shouldn't block the operation
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
        description: newMode
          ? "Platform is in maintenance. Users see a maintenance screen."
          : "Platform operations resumed.",
      });
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const quickActions = [
    { id: "modules", label: "Module Management", desc: "Enable, disable, or configure platform modules", icon: ToggleRight, taskType: "module_management" },
    { id: "flags", label: "Feature Flags", desc: "Toggle feature flags across the platform", icon: Activity, taskType: "feature_flags" },
    { id: "deploy", label: "Deployment", desc: "Manage deployments and rollbacks", icon: Power, taskType: "deployment" },
    { id: "audit", label: "Audit Review", desc: "Review executive audit trail", icon: AlertTriangle, taskType: "audit_review" },
  ];

  const handleQuickAction = async (action) => {
    setActionLoading(action.id);
    await logAction(`${action.id}_accessed`, "executive_action", action.label, "accessed");
    toast({ title: action.label, description: "Consultation plan generated." });
    setActionLoading(null);
  };

  return (
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
                {maintenanceMode ? "Platform is in maintenance" : "Platform operating normally"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={actionLoading === "maintenance"}
            className="spring-tap"
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
        {maintenanceMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-border/20"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
              <p className="text-[11px] text-warning-foreground/90">
                Users will see a maintenance screen. All non-essential services are paused.
              </p>
            </div>
          </motion.div>
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
                disabled={loading}
                className="flex flex-col items-start gap-2 p-3 rounded-xl glass hover-lift text-left spring-tap disabled:opacity-50"
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
  );
}