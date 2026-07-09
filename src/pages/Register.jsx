import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, User, Globe, ChevronDown, Check, Sparkles } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLogo from "@/components/auth/AuthLogo";
import SocialButtons from "@/components/auth/SocialButtons";
import VisitorBud from "@/components/auth/VisitorBud";
import { COUNTRIES } from "@/data/universities";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("form");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => { if (authed) navigate("/"); });
  }, [navigate]);

  useEffect(() => {
    if (stage !== "otp" || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown]);

  useEffect(() => {
    if (stage !== "otp") return;
    setCountdown(60);
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [stage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStage("otp");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      if (fullName.trim()) {
        try { await base44.auth.updateMe({ full_name: fullName.trim(), country }); } catch {}
      }
      setStage("success");
      setTimeout(() => { window.location.href = "/university-selection"; }, 1800);
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      setCountdown(60);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  /* ── SUCCESS ── */
  if (stage === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
        <motion.div className="absolute top-[10%] left-[5%] w-[60%] h-[40%] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none" animate={{ x: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 gold-glow">
          <Check className="w-12 h-12 text-primary" strokeWidth={3} />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-heading font-bold text-[20px] text-foreground mb-1">Welcome to UNIBUD! 🎉</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-[14px] text-muted-foreground">Setting up your experience...</motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ── OTP ── */
  if (stage === "otp") {
    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        <motion.div className="absolute top-[-15%] left-[-10%] w-[70%] h-[40%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none" animate={{ x: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity }} />
        <div className="flex-1 overflow-y-auto px-6 pt-12 pb-8 relative z-10 no-scrollbar">
          <AuthLogo />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-7">
            <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">Verify your email</h2>
            <p className="text-[14px] text-muted-foreground">We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span></p>
            <button onClick={() => setStage("form")} className="text-[12px] text-primary font-semibold hover:underline mt-1.5">Change email</button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30">
            {error && <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-[13px]">{error}</div>}

            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} className="w-11 h-12 text-[18px]" />)}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {elapsed > 30 && !loading && (
              <div className="flex items-start gap-2 mb-4 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-muted-foreground leading-relaxed">Taking a moment? No worries — sometimes emails take a little longer. Check your spam folder, or try resending.</p>
              </div>
            )}

            <button onClick={handleVerify} disabled={loading || otpCode.length < 6} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(218,175,55,0.3)]">
              {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Verifying...</> : <><Check className="w-[18px] h-[18px]" /> Verify</>}
            </button>

            <p className="text-center text-[13px] text-muted-foreground mt-4">
              {countdown > 0 ? (
                <>Resend code in <span className="font-semibold text-foreground">{countdown}s</span></>
              ) : (
                <>Didn't receive it? <button onClick={handleResend} className="text-primary font-semibold hover:underline">Resend code</button></>
              )}
            </p>
          </motion.div>
        </div>
        <VisitorBud />
      </div>
    );
  }

  /* ── FORM ── */
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div className="absolute top-[-15%] left-[-10%] w-[70%] h-[40%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none" animate={{ x: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity }} />
      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-8 relative z-10 no-scrollbar">
        <AuthLogo />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-7">
          <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">Create Account</h2>
          <p className="text-[14px] text-muted-foreground">Join UNIBUD in seconds.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30">
          {error && <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-[13px]">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="w-full pl-10 pr-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" required autoFocus />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Email or Phone Number</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Country</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full pl-10 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none" required>
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(218,175,55,0.3)]">
              {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Creating account...</> : <>Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-2xl bg-muted/50 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">More information will be collected after verification to personalize your university experience.</p>
          </div>
        </motion.div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
          <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-background px-3 text-muted-foreground font-medium">or</span></div>
        </div>

        <SocialButtons redirectTo="/university-selection" />

        <p className="text-center text-[13px] text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
      <VisitorBud />
    </div>
  );
}