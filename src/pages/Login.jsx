import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, Check } from "lucide-react";
import AuthLogo from "@/components/auth/AuthLogo";
import SocialButtons from "@/components/auth/SocialButtons";
import VisitorBud from "@/components/auth/VisitorBud";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => { if (authed) navigate("/"); });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(identifier, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[70%] h-[40%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-8 relative z-10 no-scrollbar">
        <AuthLogo />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-7"
        >
          <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">Welcome Back 👋</h2>
          <p className="text-[14px] text-muted-foreground">Continue your university journey.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30"
        >
          {error && <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-[13px]">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Email, Phone or Student ID</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-2">
                <div className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center transition-colors ${rememberMe ? "bg-primary border-primary" : "border-border bg-transparent"}`}>
                  {rememberMe && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                </div>
                <span className="text-[12px] text-muted-foreground font-medium">Remember me</span>
              </button>
              <Link to="/forgot-password" className="text-[12px] text-primary font-semibold hover:underline">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(109, 40, 217,0.3)]"
            >
              {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
            </button>
          </form>
        </motion.div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
          <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-background px-3 text-muted-foreground font-medium">or</span></div>
        </div>

        <SocialButtons redirectTo="/" />

        <p className="text-center text-[13px] text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">Create Account</Link>
        </p>
      </div>

      <VisitorBud />
    </div>
  );
}