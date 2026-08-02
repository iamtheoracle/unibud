import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, QrCode, Shield, CheckCircle2, GraduationCap, MapPin, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const CREAM_SUBTLE = "rgba(247, 240, 232, 0.15)";
const ORANGE = "#FF8A2A";
const EASE = [0.16, 1, 0.3, 1];

export default function DigitalId() {
  const [showQR, setShowQR] = React.useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: records } = useQuery({
    queryKey: ["my-student-record"],
    queryFn: () => base44.entities.StudentRecord.filter({ user_id: user?.id || "none" }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const record = records?.[0];

  const displayName = record?.full_name || user?.full_name || "Student";
  const matric = record?.matriculation_number || "—";
  const university = record?.university || user?.data?.university || "University";
  const faculty = record?.faculty || "—";
  const department = record?.department || "—";
  const level = record?.level || "—";
  const verified = record?.is_verified;

  const qrPayload = JSON.stringify({ uid: user?.id, name: displayName, matric, university, ts: Date.now() });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrPayload)}`;

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/home" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>Digital ID</h1>
          <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Your campus identity card</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showQR ? (
          <motion.div key="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4, ease: EASE }}>
            {/* ID Card */}
            <div className="relative overflow-hidden rounded-[24px] p-6 mb-5" style={{ background: "linear-gradient(135deg, rgba(44,33,26,0.95), rgba(30,22,16,0.95))", border: "1px solid rgba(255,138,42,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374aa5?w=800')", backgroundSize: "cover" }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-[10px] grid place-items-center" style={{ background: "rgba(255,138,42,0.15)" }}>
                      <GraduationCap className="w-5 h-5" style={{ color: ORANGE }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold" style={{ color: CREAM }}>UNIBUD</p>
                      <p className="text-[9px] uppercase tracking-wider" style={{ color: CREAM_MUTED }}>Student ID</p>
                    </div>
                  </div>
                  {verified && <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}><CheckCircle2 className="w-3 h-3" /> Verified</span>}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-[18px] overflow-hidden shrink-0 grid place-items-center" style={{ background: "rgba(255,138,42,0.10)" }}>
                    {record?.avatar_url || user?.data?.avatar_url ? <img src={record?.avatar_url || user?.data?.avatar_url} className="w-full h-full object-cover" /> : <span className="text-[28px] font-bold" style={{ color: ORANGE }}>{displayName.charAt(0)}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[18px] font-bold leading-tight truncate" style={{ color: CREAM }}>{displayName}</p>
                    <p className="text-[12px] truncate" style={{ color: CREAM_MUTED }}>{university}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Matric No" value={matric} />
                  <InfoField label="Level" value={`${level}L`} />
                  <InfoField label="Faculty" value={faculty} />
                  <InfoField label="Department" value={department} />
                </div>
              </div>
            </div>

            <button onClick={() => setShowQR(true)} className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-2 font-semibold text-[15px] spring-tap" style={{ background: ORANGE, color: "#1a1208" }}>
              <QrCode className="w-5 h-5" /> Show QR Code
            </button>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <QuickLink to="/smart-attendance" icon={CheckCircle2} label="Check-in" />
              <QuickLink to="/library" icon={Shield} label="Library" />
              <QuickLink to="/safety" icon={Shield} label="Safety" />
            </div>
          </motion.div>
        ) : (
          <motion.div key="qr" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
              <button onClick={() => setShowQR(false)} className="flex items-center gap-2 text-[13px] spring-tap" style={{ color: ORANGE }}>
                <ArrowLeft className="w-4 h-4" /> Back to ID
              </button>
            </div>

            <div className="glass-card p-6 mb-6 flex flex-col items-center">
              <p className="text-[13px] mb-4" style={{ color: CREAM_MUTED }}>Scan for verification</p>
              <div className="w-64 h-64 rounded-[20px] overflow-hidden grid place-items-center" style={{ background: CREAM }}>
                <img src={qrUrl} alt="Student QR Code" className="w-full h-full object-contain" />
              </div>
              <p className="text-[16px] font-bold mt-4" style={{ color: CREAM }}>{displayName}</p>
              <p className="text-[12px]" style={{ color: CREAM_MUTED }}>{matric}</p>
            </div>

            <p className="text-[12px] text-center max-w-[300px]" style={{ color: CREAM_MUTED }}>
              Present this QR at attendance, library, building access, and campus events.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(247,240,232,0.35)" }}>{label}</p>
      <p className="text-[13px] font-semibold truncate" style={{ color: CREAM }}>{value}</p>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 py-4 rounded-[14px] spring-tap" style={{ background: "rgba(44,33,26,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <Icon className="w-5 h-5" strokeWidth={1.8} style={{ color: ORANGE }} />
      <span className="text-[11px] font-medium" style={{ color: CREAM_MUTED }}>{label}</span>
    </Link>
  );
}