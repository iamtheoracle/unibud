import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, User } from "lucide-react";

const PHASE = { calling: "calling", connecting: "connecting", active: "active" };

/**
 * CallScreen — voice & video call interface.
 * Supports /call (demo contact) and /call/:contactId, with ?video=1 for video.
 * Simulated connect → active states with a live duration timer and full
 * call controls. Media transmission requires a WebRTC backend not available
 * in this environment; this is the ready-to-wire UI shell.
 */
export default function CallScreen() {
  const { contactId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isVideo = params.get("video") === "1";
  const name = contactId ? decodeURIComponent(contactId) : "Adaeze Okafor";

  const [phase, setPhase] = useState(PHASE.calling);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(isVideo);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(PHASE.connecting), 1500);
    const t2 = setTimeout(() => setPhase(PHASE.active), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== PHASE.active) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const duration = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const statusLabel = phase === PHASE.calling ? "Calling…" : phase === PHASE.connecting ? "Connecting…" : duration;

  const end = () => navigate(-1);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between safe-area-pt safe-area-pb relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 to-black pointer-events-none" />

      {/* Self preview (video) */}
      {videoOn && phase === PHASE.active && (
        <div className="absolute top-5 right-4 w-24 h-32 rounded-2xl bg-secondary border border-border/40 overflow-hidden flex items-center justify-center z-10">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {/* Contact */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 pt-20 z-10">
        <div className="relative">
          {phase !== PHASE.active && (
            <>
              <span className="absolute inset-0 rounded-full bg-foreground/20 animate-ping" />
              <span className="absolute -inset-4 rounded-full bg-foreground/10 animate-ping" style={{ animationDelay: "0.3s" }} />
            </>
          )}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-foreground to-muted-foreground flex items-center justify-center text-[40px] font-bold text-background relative"
          >
            {name.charAt(0).toUpperCase()}
          </motion.div>
        </div>
        <div className="text-center">
          <h1 className="text-[22px] font-bold text-white">{name}</h1>
          <p className="text-[13px] text-white/60 mt-1 tabular-nums">{statusLabel}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="pb-10 px-6 w-full max-w-sm z-10">
        <div className="flex items-center justify-center gap-4">
          <CallBtn icon={muted ? MicOff : Mic} label={muted ? "Muted" : "Mute"} active={muted} onClick={() => setMuted((m) => !m)} />
          {isVideo && (
            <CallBtn icon={videoOn ? Video : VideoOff} label="Video" active={!videoOn} onClick={() => setVideoOn((v) => !v)} />
          )}
          <CallBtn icon={Volume2} label="Speaker" onClick={() => {}} />
          <button onClick={end} className="w-16 h-16 rounded-full bg-error text-white flex items-center justify-center spring-tap" aria-label="End call">
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CallBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 spring-tap">
      <span className={`w-14 h-14 rounded-full flex items-center justify-center ${active ? "bg-foreground text-background" : "bg-white/10 text-white"}`}>
        <Icon className="w-6 h-6" />
      </span>
      <span className="text-[10px] text-white/60 font-medium">{label}</span>
    </button>
  );
}