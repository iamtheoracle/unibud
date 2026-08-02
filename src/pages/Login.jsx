import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import GlassInput from "@/components/foundation/GlassInput";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

const EASE = [0.16, 1, 0.3, 1];

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => { if (authed) navigate("/auth-router", { replace: true }); });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(identifier, password);

      // If a platform access code was entered, validate & elevate silently.
      // The code is never stored, never displayed back — evaluated and discarded.
      if (accessCode.trim()) {
        try {
          await base44.functions.invoke("validatePlatformAccess", { access_code: accessCode.trim() });
        } catch {
          // Invalid code doesn't block login — user still authenticates normally
        }
      }

      // Oracle silently evaluates role + permissions and routes to the correct workspace
      window.location.href = "/auth-router";
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
        <button onClick={() => navigate("/welcome")} className="text-muted-foreground mt-6 mb-7 spring-tap self-start">
          <span className="text-[13px] font-medium">Back</span>
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                trailing={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[12px] font-semibold text-muted-foreground hover:text-foreground px-1">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
              />

              <GlassInput
                label="Platform Access Code (optional)"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="For staff & administrators"
                autoComplete="off"
              />

              <button type="submit" disabled={loading} className="w-full h-[54px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2.5 spring-tap disabled:opacity-50 ice-glow mt-2">
                {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Signing in…</> : "Login"}
              </button>
            </form>

            <div className="flex justify-center mt-4">
              <Link to="/forgot-password" className="text-[13px] text-primary font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] font-medium text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="mt-3">
              <SocialAuthButtons onError={setError} />
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