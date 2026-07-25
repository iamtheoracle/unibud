import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Loader2, ArrowRight, Lock, Mail, ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import GlassInput from "@/components/foundation/GlassInput";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Login — Screen 4.
 * Email or Phone + Password. Login + Forgot Password. Company footer.
 */
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
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <SparkField count={12} />
      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt safe-area-pb no-scrollbar overflow-y-auto">
        <button onClick={() => navigate("/welcome")} className="flex items-center gap-1.5 text-muted-foreground mt-6 mb-7 spring-tap self-start">
          <ArrowLeft className="w-[18px] h-[18px]" /> <span className="text-[13px] font-medium">Back</span>
        </button>

        <BrandLogo size="sm" />

        <div className="flex-1 flex flex-col justify-center py-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="mb-6">
            <h2 className="font-heading font-bold text-[26px] tracking-tight text-foreground mb-1.5">Welcome back</h2>
            <p className="text-[14px] text-muted-foreground">Continue your university journey.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: EASE }} className="glass-card p-5">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <GlassInput
                label="Email or Phone"
                icon={Mail}
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                autoFocus
                required
              />
              <GlassInput
                label="Password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                trailing={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground/70 hover:text-foreground p-1">
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                }
              />

              <button type="submit" disabled={loading} className="w-full h-[54px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2.5 spring-tap disabled:opacity-50 ice-glow mt-2">
                {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Signing in…</> : <>Login <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
              </button>
            </form>

            <div className="flex justify-center mt-4">
              <Link to="/forgot-password" className="text-[13px] text-primary font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
          </motion.div>

          <p className="text-center text-[13px] text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create Account</Link>
          </p>
        </div>

        <div className="pb-8 safe-area-pb">
          <CompanyFooter />
        </div>
      </div>
    </div>
  );
}