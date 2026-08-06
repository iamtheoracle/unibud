import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Healthy" },
  degraded: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Degraded" },
  critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Critical" },
  unknown: { icon: HelpCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" },
};

/**
 * HealthGrid — displays real-time platform service health.
 * Each service card shows status, criticality, and any active checks.
 */
export default function HealthGrid({ services = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {services.map((service, i) => {
        const config = STATUS_CONFIG[service.status] || STATUS_CONFIG.unknown;
        const Icon = config.icon;
        return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className={`p-3 rounded-xl glass ${service.status === "critical" ? "border border-destructive/30" : ""}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold truncate">{service.label}</span>
              {service.critical && (
                <span className="w-1.5 h-1.5 rounded-full bg-destructive/60" title="Critical service" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-md ${config.bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}