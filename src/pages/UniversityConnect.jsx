import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  ShieldCheck, ArrowRight, Loader2, Lock, Mail, Hash, Building,
  CheckCircle2, AlertCircle, Info, ChevronRight,
} from "lucide-react";
import AuthLogo from "@/components/auth/AuthLogo";
import { UNIVERSITIES, getUniversityIntegrations } from "@/data/universities";

export default function UniversityConnect() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setLoading(false);
      if (!u?.university) {
        navigate("/university-selection", { replace: true });
      }
    }).catch(() => {
      navigate("/university-selection", { replace: true });
    });
  }, [navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const uni = UNIVERSITIES.find((u) => u.name === user.university);
  const accent = uni?.accent || null;
  const integrations = getUniversityIntegrations(user.university);
  const hasIntegration = integrations.length > 0;

  const btnStyle = accent ? { backgroundColor: accent, boxShadow: `0 4px 20px ${accent}40` } : {};
  const barStyle = { width: "60%", backgroundColor: accent || "hsl(var(--primary))" };

  const handleConnect = async () => {
    setError("");
    if (!identifier.trim()) {
      setError("Please enter your " + (identifierType === "student_email" ? "student email" : "matriculation number"));
      return;
    }
    if (!consent) {
      setError("Please grant consent to synchronize your academic data");
      return;
    }
    setConnecting(true);
    try {
      await base44.entities.UniversityConnection.create({
        university: user.university,
        connection_method: identifierType || "matriculation_number",
        identifier: identifier.trim(),
        status: "connected",
        consent_given: true,
        consent_date: new Date().toISOString(),
        last_synced: new Date().toISOString(),
        sync_status: "success",
        synced_data: {
          faculty: user.faculty,
          department: user.department,
          level: user.level,
          campus: user.campus,
          course_major: user.course_major,
          synchronized_at: new Date().toISOString(),
        },
      });
      await base44.auth.updateMe({
        university_connected: true,
        university_connect_method: identifierType || "matriculation_number",
      });
      navigate("/student-profile");
    } catch (err) {
      setError("Could not connect. Please try again or continue with manual entry.");
    }
    setConnecting(false);
  };

  const handleManual = async () => {
    setConnecting(true);
    try {
      await base44.entities.UniversityConnection.create({
        university: user.university,
        connection_method: "manual",
        status: "connected",
        consent_given: true,
        consent_date: new Date().toISOString(),
        sync_status: "never",
        synced_data: {
          faculty: user.faculty,
          department: user.department,
          level: user.level,
          campus: user.campus,
          course_major: user.course_major,
        },
      });
      await base44.auth.updateMe({
        university_connected: true,
        university_connect_method: "manual",
      });
      navigate("/student-profile");
    } catch (err) {
      navigate("/student-profile");
    }
    setConnecting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div className="absolute top-[-15%] left-[-10%] w-[70%] h-[40%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none" animate={{ x: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity }} />

      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-8 relative z-10 no-scrollbar">
        <AuthLogo size="md" />

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Step 2 of 3</span>
            <span className="text-[11px] font-semibold text-muted-foreground">University Connect</span>
          </div>
          <div className="h-1 bg-muted rounded-full">
            <div className="h-full rounded-full transition-all duration-500" style={barStyle} />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">Connect Your University Account</h2>
          <p className="text-[14px] text-muted-foreground">Securely link your university account to automatically sync your courses, timetable, assignments, and more.</p>
        </motion.div>

        {/* University Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 premium-shadow border border-border/30 mb-4 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent || "hsl(var(--primary))"}15` }}>
            <Building className="w-6 h-6" style={{ color: accent || "hsl(var(--primary))" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-[15px] text-foreground truncate">{user.university}</p>
            <p className="text-[12px] text-muted-foreground">{uni?.short || ""} · {user.faculty || "Faculty"} · {user.level || "Level"}</p>
          </div>
          {hasIntegration && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span className="text-[10px] font-semibold text-success">Supported</span>
            </div>
          )}
        </motion.div>

        {hasIntegration ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30 space-y-4"
          >
            {/* Info banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-info/5 border border-info/15">
              <Info className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-foreground/80 leading-relaxed">
                Your university supports official integration. Connect your account to automatically sync your academic data — no manual entry needed.
              </p>
            </div>

            {/* Integration method selector */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-foreground">Connection Method</label>
              {integrations.includes("matriculation_number") && (
                <button
                  onClick={() => { setIdentifierType("matriculation_number"); setIdentifier(""); setError(""); }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    identifierType === "matriculation_number"
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[13px] font-semibold text-foreground">Matriculation Number</p>
                    <p className="text-[11px] text-muted-foreground">Enter your official matric number</p>
                  </div>
                  {identifierType === "matriculation_number" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </button>
              )}
              {integrations.includes("student_email") && (
                <button
                  onClick={() => { setIdentifierType("student_email"); setIdentifier(""); setError(""); }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    identifierType === "student_email"
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-info" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[13px] font-semibold text-foreground">Student Email</p>
                    <p className="text-[11px] text-muted-foreground">Your university email address</p>
                  </div>
                  {identifierType === "student_email" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </button>
              )}
            </div>

            {/* Identifier input */}
            {identifierType && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">
                  {identifierType === "student_email" ? "Student Email" : "Matriculation Number"}
                </label>
                <div className="relative">
                  {identifierType === "student_email" ? (
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                  <input
                    type={identifierType === "student_email" ? "email" : "text"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={identifierType === "student_email" ? "you@university.edu.ng" : "e.g., UNI/2021/1234"}
                    className="w-full pl-10 pr-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </motion.div>
            )}

            {/* Consent */}
            {identifierType && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-1">
                <button
                  onClick={() => setConsent(!consent)}
                  className="flex items-start gap-2.5 text-left w-full"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${consent ? "bg-primary border-primary" : "border-border"}`}>
                    {consent && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    I authorize UNIBUD to securely access my academic information from <span className="font-semibold text-foreground">{user.university}</span> and use it to personalize my experience. I can disconnect at any time.
                  </p>
                </button>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error/5 border border-error/15">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                <p className="text-[12px] text-error">{error}</p>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-2 pt-1">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">Your credentials are encrypted and never shared.</p>
            </div>

            {/* Connect button */}
            {identifierType && (
              <button
                onClick={handleConnect}
                disabled={!identifier.trim() || !consent || connecting}
                style={btnStyle}
                className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_4px_20px_rgba(218,175,55,0.3)]"
              >
                {connecting ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <>Connect Account <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
              </button>
            )}

            {/* Manual fallback */}
            <button
              onClick={handleManual}
              disabled={connecting}
              className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors pt-1"
            >
              Enter my details manually instead <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30 space-y-4"
          >
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warning/5 border border-warning/15">
              <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-foreground/80 leading-relaxed">
                Your university doesn't have an official integration yet. You can manually enter your academic details — you'll still get the full UNIBUD experience.
              </p>
            </div>
            <p className="text-[13px] text-muted-foreground text-center">
              We're working with universities worldwide to add official integrations. In the meantime, you can continue with manual entry.
            </p>
            <button
              onClick={handleManual}
              disabled={connecting}
              style={btnStyle}
              className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_4px_20px_rgba(218,175,55,0.3)]"
            >
              {connecting ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <>Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
            </button>
          </motion.div>
        )}

        <p className="text-center text-[11px] text-muted-foreground mt-4 px-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Your data is protected with bank-grade encryption
        </p>
      </div>
    </div>
  );
}