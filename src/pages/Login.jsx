import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Loader2, ArrowRight, Lock, Mail, ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";

const EASE = [0.16, 1, 0.3, 1];

const inputBase =
  "w-full h-[52px] pl-11 pr-11 rounded-2xl bg-white/[0.04] border border-white/10 text-[15px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-xl focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => { if (authed) navigate("/meet-bud", { replace: true }); });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(identifier, password);
      navigate("/meet-bud", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <SparkField count={10} />
      <div className="flex-1 overflow-y-auto px-6 pt-14 pb-8 safe-area-pt safe-area-pb relative z-10 no-scrollbar">
        <button onClick={() => navigate("/welcome")} className="flex items-center gap-1.5 text-muted-foreground mb-8 spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" /> <span className="text-[13px] font-medium">Back</span>
        </button>
        <BrandLogo size="sm" />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE }} className="mt-8 mb-6">
          <h2 className="font-heading font-bold text-[24px] tracking-tight text-foreground mb-1.5">Welcome back</h2>
          <p className="text-[14px] text-muted-foreground">Continue your university journey.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: EASE }} className="glass-card p-5">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Email or Phone</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com" className={inputBase} required autoFocus />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputBase} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground">
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow mt-2">
              {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Signing in…</> : <>Sign In <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-[13px] text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">Create Account</Link>
        </p>

        <div className="mt-8">
          <CompanyFooter />
        </div>
      </div>
    </div>
  );
}