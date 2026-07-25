import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import GlassInput from "@/components/foundation/GlassInput";

const EASE = [0.16, 1, 0.3, 1];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <SparkField count={12} />
      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt safe-area-pb no-scrollbar overflow-y-auto">
        <Link to="/login" className="text-muted-foreground mt-6 mb-7 spring-tap self-start">
          <span className="text-[13px] font-medium">Back</span>
        </Link>

        <BrandLogo size="sm" />

        <div className="flex-1 flex flex-col justify-center py-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="mb-6">
            <h2 className="font-heading font-bold text-[26px] tracking-tight text-foreground mb-1.5">Reset password</h2>
            <p className="text-[14px] text-muted-foreground">We'll send you a link to reset it.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: EASE }} className="glass-card p-5">
            {sent ? (
              <div className="flex flex-col items-center text-center py-4">
                <p className="text-[14px] text-foreground leading-relaxed max-w-[300px]">
                  If an account exists with that email, you'll receive a password reset link shortly.
                </p>
                <Link to="/login" className="mt-6 text-[13px] text-primary font-semibold hover:underline">
                  Back to log in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <GlassInput
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow"
                >
                  {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Sending…</> : "Send reset link"}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        <div className="pb-8 safe-area-pb">
          <CompanyFooter />
        </div>
      </div>
    </div>
  );
}