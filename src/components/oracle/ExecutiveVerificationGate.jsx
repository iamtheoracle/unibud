import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Loader2, KeyRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

/**
 * ExecutiveVerificationGate — secure authority code input.
 * Calls the verifyAuthorityCode backend function. The code is never
 * stored in component state beyond the input field, and is cleared
 * immediately after verification.
 */
export default function ExecutiveVerificationGate({ onVerified }) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [scope, setScope] = useState("platform_management");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("verifyAuthorityCode", {
        code: code.trim(),
        scope,
      });
      const result = res.data || res;

      if (result.status === "verified") {
        toast({ title: "Executive Authority Verified", description: "Oracle is now in Executive Mode." });
        onVerified(result);
        setCode("");
      } else {
        toast({ title: "Verification Failed", description: result.message || "Invalid authority code.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Verification Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="crystal-card radius-xl p-7 max-w-[400px] w-full edge-light"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center mb-3 crystal-bloom">
            <KeyRound className="w-6 h-6 text-primary" strokeWidth={1.8} />
          </div>
          <h2 className="font-heading font-bold text-[17px]">Executive Authority</h2>
          <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed max-w-[280px]">
            Enter your authority code to activate Executive Mode. Oracle will coordinate specialist agents for all authorized operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Authority Code
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ADM-XXX"
              autoComplete="off"
              autoCapitalize="characters"
              disabled={loading}
              className="oracle-input w-full text-center text-[15px] font-mono tracking-[0.15em]"
              style={{ height: 44 }}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              disabled={loading}
              className="oracle-input w-full"
            >
              <option value="platform_management">Platform Management</option>
              <option value="module_management">Module Management</option>
              <option value="security_operations">Security Operations</option>
              <option value="deployment">Deployment</option>
              <option value="audit_review">Audit Review</option>
              <option value="general">General</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-[14px] spring-tap flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
            ) : (
              <><Shield className="w-4 h-4" /> Verify Authority</>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-border/30 flex items-start gap-2">
          <Lock className="w-3 h-3 text-muted-foreground/60 mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            Codes are verified server-side and never stored. Each verification is audit-logged with a non-reversible hash.
          </p>
        </div>
      </motion.div>
    </div>
  );
}