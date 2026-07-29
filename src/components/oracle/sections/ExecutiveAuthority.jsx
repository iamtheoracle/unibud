import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LogOut, Clock } from "lucide-react";
import ExecutiveVerificationGate from "@/components/oracle/ExecutiveVerificationGate";
import ExecutiveAgentPanel from "@/components/oracle/ExecutiveAgentPanel";
import ExecutivePlatformControls from "@/components/oracle/ExecutivePlatformControls";
import { generateExecutivePlan } from "@/lib/oracle/executiveMode";

/**
 * ExecutiveAuthority — Oracle section for authority code verification
 * and executive mode platform management. The admin verifies their
 * authority code, then gains access to platform controls orchestrated
 * by Oracle with specialist agent consultation.
 */
export default function ExecutiveAuthority({ module, onActive }) {
  const [verification, setVerification] = useState(null);

  const consultationPlan = verification
    ? generateExecutivePlan(verification.authorityCode, "platform_management", "Executive platform management")
    : null;

  const handleLogout = () => {
    setVerification(null);
  };

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
              {verification ? "Executive Mode Active" : "Verification Required"}
            </p>
          </div>
        </div>
        {verification && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-[11px] font-medium spring-tap text-muted-foreground"
          >
            <LogOut className="w-3 h-3" /> Exit Executive Mode
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
            <ExecutiveAgentPanel
              verification={verification}
              consultationPlan={consultationPlan}
            />
            <ExecutivePlatformControls verification={verification} />

            {/* Verification metadata */}
            <div className="crystal-card radius-lg p-4 lg:col-span-2">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Verified at {new Date(verification.verifiedAt).toLocaleString()}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="font-mono">ID: {verification.verificationId}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}