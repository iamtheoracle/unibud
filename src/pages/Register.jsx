import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const STEPS = [
  { key: "name", title: "What's your name?", hint: "We'll personalize your experience.", label: "Full Name", type: "text", placeholder: "Your full name", autoComplete: "name" },
  { key: "email", title: "Your email address", hint: "We'll send a verification code here.", label: "Email Address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
  { key: "phone", title: "Your phone number", hint: "For account security and reminders.", label: "Phone Number", type: "tel", placeholder: "+234 800 000 0000", autoComplete: "tel" },
  { key: "password", title: "Create a password", hint: "At least 6 characters.", label: "Create Password", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
];

export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("form");
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

  useEffect(() => { if (stage === "otp") setCountdown(60); }, [stage]);

  const current = STEPS[step];
  const validate = (i) => {
    const v = values[STEPS[i].key].trim();
    if (!v) return "This field is required";
    if (STEPS[i].key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email";
    if (STEPS[i].key === "password" && v.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleNext = async () => {
    setError("");
    const err = validate(step);
    if (err) { setError(err); return; }
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email: values.email.trim(), password: values.password });
      setStage("otp");
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 0) setStep(step - 1);
    else navigate("/welcome");
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: values.email.trim(), otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      try {
        await base44.auth.updateMe({ full_name: values.name.trim(), phone_number: values.phone.trim() });
      } catch {}
      setStage("success");
      setTimeout(() => navigate("/meet-bud", { replace: true }), 1800);
    } catch (e) {
      setError(e.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(values.email.trim());
      setCountdown(60);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (e) {
      setError(e.message || "Failed to resend code");
    }
  };

  if (stage === "success") {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center">
        <SparkField count={18} />
        <motion.div
          className="absolute top-[10%] w-[60%] h-[40%] rounded-full blur-[110px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(127,216,255,0.18), transparent 70%)" }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-heading font-bold text-[22px] text-foreground mb-1 relative z-10">
          Welcome to UNIBUD
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[14px] text-muted-foreground relative z-10">
          Introducing your companion…
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin relative z-10" />
      </div>
    );
  }

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
              We sent a 6-digit code to <span className="font-semibold text-foreground">{values.email}</span>
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: EASE }} className="glass-card p-5 mt-7">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">{error}</div>
            )}
            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="w-11 h-12 text-[18px] bg-muted/50 border-border" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || otpCode.length < 6}
              className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow"
            >
              {loading ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Verifying…</> : "Verify"}
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

  const progress = step + 1;
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <SparkField count={12} />
      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt safe-area-pb no-scrollbar overflow-y-auto">
        <div className="flex items-center justify-between mt-6 mb-7">
          <button onClick={handleBack} className="text-muted-foreground spring-tap">
            <span className="text-[13px] font-medium">Back</span>
          </button>
          <span className="text-[12px] font-semibold text-muted-foreground tracking-wide">
            Step {progress} of {STEPS.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <BrandLogo size="sm" />

        <div className="flex-1 flex flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <h2 className="font-heading font-bold text-[26px] tracking-tight text-foreground mb-1.5">
                {current.title}
              </h2>
              <p className="text-[14px] text-muted-foreground mb-7">{current.hint}</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">
                  {error}
                </div>
              )}

              <GlassInput
                label={current.label}
                type={current.type === "password" && showPassword ? "text" : current.type}
                value={values[current.key]}
                onChange={(e) => setValues({ ...values, [current.key]: e.target.value })}
                placeholder={current.placeholder}
                autoComplete={current.autoComplete}
                autoFocus
                trailing={
                  current.type === "password" ? (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[12px] font-semibold text-muted-foreground hover:text-foreground px-1">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  ) : undefined
                }
              />
            </motion.div>
          </AnimatePresence>

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full h-[54px] mt-8 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2.5 spring-tap disabled:opacity-50 ice-glow"
          >
            {loading ? (
              <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Creating account…</>
            ) : (
              "Next"
            )}
          </button>

          <p className="text-center text-[13px] text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>

        <div className="pb-8 safe-area-pb">
          <CompanyFooter />
        </div>
      </div>
    </div>
  );
}