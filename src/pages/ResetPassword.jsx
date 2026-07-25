import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Lock, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import GlassInput from "@/components/foundation/GlassInput";

const EASE = [0.16, 1, 0.3, 1];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <SparkField count={12} />
      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt safe-area-pb no-scrollbar overflow-y-auto">
        <Link to="/login" className="flex items-center gap-1.5 text-muted-foreground mt-6 mb-7 spring-tap self-start">
          <ArrowLeft className="w-[18px] h-[18px]" /> <span className="text-[13px] font-medium">Back</span>
        </Link>

        <BrandLogo size="sm" />

        <div className="flex-1 flex flex-col justify-center py-6">
          {!resetToken ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="glass-card p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/12 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="font-heading font-bold text-[20px] text-foreground mb-1.5">Invalid reset link</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
                This password reset link is missing or invalid. Please request a new one.
              </p>
              <Link to="/forgot-password" className="inline-block text-[13px] text-primary font-semibold hover:underline">
                Request a new link
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="mb-6">
                <h2 className="font-heading font-bold text-[26px] tracking-tight text-foreground mb-1.5">New password</h2>
                <p className="text-[14px] text-muted-foreground">Enter your new password below.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: EASE }} className="glass-card p-5">
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <GlassInput
                    label="New Password"
                    icon={Lock}
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <GlassInput
                    label="Confirm Password"
                    icon={Lock}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[54px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow mt-2"
                  >
                    {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Resetting…</> : "Reset password"}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </div>

        <div className="pb-8 safe-area-pb">
          <CompanyFooter />
        </div>
      </div>
    </div>
  );
}