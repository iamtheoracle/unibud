import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, User, Phone, Check, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const inputBase =
  "w-full h-[52px] pl-11 pr-11 rounded-2xl bg-white/[0.04] border border-white/10 text-[15px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-xl focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("form"); // form | otp | success
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => { if (authed) navigate("/meet-bud", { replace: true }); });
  }, [navigate]);

  useEffect(() => {
    if (stage !== "otp" || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown]);

  useEffect(() => {
    if (stage === "otp") setCountdown(60);
  }, [stage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      try {
        await base44.auth.updateMe({ full_name: fullName.trim(), phone_number: phone.trim() });
      } catch {}
      setStage("success");
      setTimeout(() => { navigate("/meet-bud", { replace: true }); }, 1800);
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
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
        <SparkField count={16} />
        <motion.div
          className="absolute top-[10%] w-[60%] h-[40%] rounded-full blur-[110px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(127,216,255,0.16), transparent 70%)" }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="w-24 h-24 rounded-full glass-strong flex items-center justify-center mb-6 ice-glow relative z-10"
        >
          <Check className="w-12 h-12 text-primary" strokeWidth={2.5} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-heading font-bold text-[22px] text-foreground mb-1 relative z-10"
        >
          Welcome to UNIBUD
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[14px] text-muted-foreground relative z-10"
        >
          Introducing your companion…
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin relative z-10"
        />
      </div>
    );
  }

  /* ── OTP ── */
  if (stage === "otp") {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <SparkField count={10} />
        <div className="flex-1 overflow-y-auto px-6 pt-14 pb-8 safe-area-pt safe-area-pb relative z-10 no-scrollbar">
          <button onClick={() => setStage("form")} className="flex items-center gap-1.5 text-muted-foreground mb-8 spring-tap">
            <ArrowLeft className="w-[18px] h-[18px]" /> <span className="text-[13px] font-medium">Back</span>
          </button>
          <BrandLogo size="sm" />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE }} className="mt-8">
            <h2 className="font-heading font-bold text-[24px] tracking-tight text-foreground mb-1.5">Verify your email</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ease: EASE }}
            className="glass-card p-5 mt-7"
          >
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">{error}</div>
            )}
            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="w-11 h-12 text-[18px] bg-white/[0.04] border-white/15" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || otpCode.length < 6}
              className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow"
            >
              {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Verifying…</> : <><Check className="w-[18px] h-[18px]" /> Verify</>}
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
      </div>
    );
  }

  /* ── FORM ── */
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <SparkField count={10} />
      <div className="flex-1 overflow-y-auto px-6 pt-14 pb-8 safe-area-pt safe-area-pb relative z-10 no-scrollbar">
        <button onClick={() => navigate("/welcome")} className="flex items-center gap-1.5 text-muted-foreground mb-8 spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" /> <span className="text-[13px] font-medium">Back</span>
        </button>
        <BrandLogo size="sm" />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE }} className="mt-8 mb-6">
          <h2 className="font-heading font-bold text-[24px] tracking-tight text-foreground mb-1.5">Create your account</h2>
          <p className="text-[14px] text-muted-foreground">Your university companion is waiting.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: EASE }} className="glass-card p-5">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className={inputBase} required autoFocus />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputBase} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className={inputBase} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputBase} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground">
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow mt-2">
              {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Creating account…</> : <>Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-[13px] text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>

        <div className="mt-8">
          <CompanyFooter />
        </div>
      </div>
    </div>
  );
}