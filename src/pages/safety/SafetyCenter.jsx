import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Siren, Phone, HeartPulse, Brain, Shield, AlertTriangle, X, CheckCircle2, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";
const RED = "#EF4444";
const EASE = [0.16, 1, 0.3, 1];

const EMERGENCY_CONTACTS = [
  { name: "Campus Security", number: "0800-CAMPUS-SEC", icon: Shield },
  { name: "Medical Centre", number: "0800-MED-CARE", icon: HeartPulse },
  { name: "Counselling Unit", number: "0800-TALK-NOW", icon: Brain },
  { name: "Student Affairs", number: "0800-STU-AFFR", icon: Phone },
];

const SAFETY_TIPS = [
  { title: "Save campus security number", description: "Keep the emergency hotline on speed dial." },
  { title: "Walk in groups at night", description: "Use the buddy system when moving around campus after dark." },
  { title: "Know your emergency exits", description: "Familiarize yourself with exit routes in lecture halls and hostels." },
  { title: "Report suspicious activity", description: "Use the SOS button or call security if you notice anything unusual." },
];

export default function SafetyCenter() {
  const [sosActive, setSosActive] = React.useState(false);
  const [sosSent, setSosSent] = React.useState(false);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/home" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>Safety Center</h1>
          <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Emergency support & resources</p>
        </div>
      </div>

      {/* SOS Button */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col items-center mb-8">
        <SOSButton active={sosActive} onActivate={() => setSosActive(true)} />
        <p className="text-[12px] mt-4 text-center max-w-[280px]" style={{ color: CREAM_MUTED }}>
          Press and hold to alert campus security with your location
        </p>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: EASE }} className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: CREAM_MUTED }}>Emergency Contacts</p>
        <div className="grid grid-cols-2 gap-3">
          {EMERGENCY_CONTACTS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.a key={i} href={`tel:${c.number}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.05, ease: EASE }} className="glass-card p-4 flex flex-col items-center gap-2 text-center spring-tap">
                <div className="w-10 h-10 rounded-full grid place-items-center" style={{ background: "rgba(255,138,42,0.12)" }}><Icon className="w-5 h-5" style={{ color: ORANGE }} /></div>
                <span className="text-[12px] font-semibold" style={{ color: CREAM }}>{c.name}</span>
                <span className="text-[11px]" style={{ color: CREAM_MUTED }}>{c.number}</span>
              </motion.a>
            );
          })}
        </div>
      </motion.section>

      {/* Wellness Resources */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE }} className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: CREAM_MUTED }}>Wellness & Support</p>
        <div className="flex flex-col gap-3">
          <ResourceCard to="/help" icon={Brain} title="Counselling & Mental Health" desc="Talk to a counsellor or submit a confidential request" color="#A855F7" />
          <ResourceCard to="/student-support" icon={HeartPulse} title="Student Support Services" desc="Academic, financial, and personal support" color="#22C55E" />
          <ResourceCard to="/help" icon={MessageSquare} title="Report an Issue" desc="Submit a support ticket or feedback" color={ORANGE} />
        </div>
      </motion.section>

      {/* Safety Tips */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: EASE }}>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: CREAM_MUTED }}>Stay Safe</p>
        <div className="flex flex-col gap-3">
          {SAFETY_TIPS.map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05, ease: EASE }} className="glass-card p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full grid place-items-center shrink-0 mt-0.5" style={{ background: "rgba(255,138,42,0.10)" }}><Shield className="w-4 h-4" style={{ color: ORANGE }} /></div>
              <div>
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: CREAM }}>{tip.title}</p>
                <p className="text-[12px]" style={{ color: CREAM_MUTED }}>{tip.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* SOS Confirmation Modal */}
      <AnimatePresence>
        {sosActive && <SOSModal onSent={() => { setSosSent(true); }} onClose={() => { setSosActive(false); setSosSent(false); }} sent={sosSent} />}
      </AnimatePresence>
    </div>
  );
}

function SOSButton({ active, onActivate }) {
  const [holding, setHolding] = React.useState(false);
  const timerRef = React.useRef(null);

  const startHold = () => {
    setHolding(true);
    timerRef.current = setTimeout(() => { onActivate(); setHolding(false); }, 1500);
  };
  const cancelHold = () => { setHolding(false); if (timerRef.current) clearTimeout(timerRef.current); };

  return (
    <button
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      className="relative w-40 h-40 rounded-full grid place-items-center spring-tap select-none"
      style={{ background: holding ? RED : "rgba(239,68,68,0.15)", border: `2px solid ${holding ? RED : "rgba(239,68,68,0.3)"}`, transition: "all 0.3s ease" }}
    >
      {holding && <motion.div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(239,68,68,0.4)" }} animate={{ scale: [1, 1.3], opacity: [0.8, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />}
      <div className="flex flex-col items-center gap-1">
        <Siren className="w-10 h-10" fill={holding ? "#fff" : "none"} style={{ color: holding ? "#fff" : RED }} />
        <span className="text-[14px] font-bold" style={{ color: holding ? "#fff" : RED }}>{holding ? "Sending…" : "SOS"}</span>
      </div>
    </button>
  );
}

function SOSModal({ onSent, onClose, sent }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const alertMut = useMutation({
    mutationFn: () => base44.entities.SafetyAlert.create({ alert_type: "sos", status: "active", description: "SOS triggered from Safety Center" }),
    onSuccess: () => { qc.invalidateQueries(["safety-alerts"]); onSent(); },
    onError: (e) => toast({ title: "Failed to send alert", description: e.message, variant: "destructive" }),
  });

  React.useEffect(() => { if (!sent) alertMut.mutate(); }, []);

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70" style={{ backdropFilter: "blur(8px)" }} onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 360, damping: 30 }} className="relative w-full max-w-[360px] rounded-[28px] p-8 text-center" style={{ background: "rgba(44,33,26,0.97)", border: "1px solid rgba(255,138,42,0.15)" }}>
        {sent ? (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }} className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-5" style={{ background: "rgba(34,197,94,0.15)" }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: "#22C55E" }} />
            </motion.div>
            <h2 className="text-[20px] font-bold mb-2" style={{ color: CREAM }}>Help is on the way</h2>
            <p className="text-[13px] mb-6" style={{ color: CREAM_MUTED }}>Campus security has been notified. Stay where you are if it's safe.</p>
            <button onClick={onClose} className="w-full h-12 rounded-[14px] font-semibold text-[14px] spring-tap" style={{ background: ORANGE, color: "#1a1208" }}>Close</button>
          </>
        ) : (
          <>
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 1, repeat: Infinity }} className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-5" style={{ background: "rgba(239,68,68,0.15)" }}>
              <AlertTriangle className="w-10 h-10" style={{ color: RED }} />
            </motion.div>
            <h2 className="text-[20px] font-bold mb-2" style={{ color: CREAM }}>Sending Alert…</h2>
            <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Notifying campus security with your location</p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function ResourceCard({ to, icon: Icon, title, desc, color }) {
  return (
    <Link to={to} className="glass-card p-4 flex items-center gap-3 spring-tap">
      <div className="w-11 h-11 rounded-full grid place-items-center shrink-0" style={{ background: `${color}1a` }}><Icon className="w-5 h-5" style={{ color }} /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold" style={{ color: CREAM }}>{title}</p>
        <p className="text-[12px] truncate" style={{ color: CREAM_MUTED }}>{desc}</p>
      </div>
    </Link>
  );
}