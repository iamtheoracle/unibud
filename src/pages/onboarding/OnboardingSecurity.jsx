import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];
const PERSONA = "Andrew";

export default function OnboardingSecurity() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("form");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (stage !== "otp" || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown]);
  useEffect(() => { if (stage === "otp") setCountdown(60); }, [stage]);

  const finish = async () => {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (!agree) { setError("Please agree to the Terms & Privacy Policy"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email: email.trim(), password });
      setStage("otp");
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await base44.auth.verifyOtp({ email: email.trim(), otpCode: otp });
      if (res?.access_token) base44.auth.setToken(res.access_token);
      try { await base44.auth.updateMe({ full_name: PERSONA }); } catch {}
      navigate("/onboarding/preparing", { replace: true });
    } catch (e) {
      setError(e.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email.trim());
      setCountdown(60);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (e) {
      setError(e.message || "Failed to resend code");
    }
  };

  if (stage === "otp") {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
        <SparkField count={12} />
        <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt safe-area-pb no-scrollbar overflow-y-auto">
          <button onClick={() => setStage("form")} className="text-muted-foreground mt-6 mb-7 spring-tap self-start">
            <span className="text-[13px] font-medium">Back</span>
          </button>
          <BrandLogo size="sm" />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE }} className="mt-8">
            <h2 className="font-heading font-bold text-[24px] tracking-tight text-foreground mb-1.5">Verify your email</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
            </p>
          </motion.div>
          <div className="glass-card p-5 mt-7">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">{error}</div>
            )}
            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="w-11 h-12 text-[18px] bg-muted/50 border-border" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              onClick={verify}
              disabled={loading || otp.length < 6}
              className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow"
            >
              {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Verifying…</> : "Verify"}
            </button>
            <p className="text-center text-[13px] text-muted-foreground mt-4">
              {countdown > 0 ? (
                <>Resend code in <span className="font-semibold text-foreground">{countdown}s</span></>
              ) : (
                <>Didn't receive it? <button onClick={resend} className="text-primary font-semibold hover:underline">Resend code</button></>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <SparkField count={12} />
      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt safe-area-pb no-scrollbar overflow-y-auto">
        <div className="flex items-center justify-between mt-6 mb-7">
          <button onClick={() => navigate("/onboarding/conversation")} className="text-muted-foreground spring-tap">
            <span className="text-[13px] font-medium">Back</span>
          </button>
          <BrandLogo size="sm" />
          <span className="w-10" />
        </div>

        <div className="flex-1 flex flex-col justify-center py-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="mb-7">
            <h2 className="font-heading font-bold text-[26px] tracking-tight text-foreground mb-1.5">
              Almost there, {PERSONA} 👋
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Bud has everything needed to personalize your experience. Now let's secure your account.
            </p>
          </motion.div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">{error}</div>
          )}

          <div className="space-y-4">
            <GlassInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
            <GlassInput
              label="Create Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              trailing={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-[12px] font-semibold text-muted-foreground hover:text-foreground px-1">
                  {showPw ? "Hide" : "Show"}
                </button>
              }
            />
            <GlassInput
              label="Confirm Password"
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <label className="flex items-center gap-2.5 mt-5 text-[14px] text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-5 h-5 rounded-md accent-primary"
            />
            <span>I agree to UNIBUD's Terms & Privacy Policy</span>
          </label>

          <button
            onClick={finish}
            disabled={loading}
            className="w-full h-[54px] mt-7 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2.5 spring-tap disabled:opacity-50 ice-glow"
          >
            {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Creating account…</> : "Finish Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}