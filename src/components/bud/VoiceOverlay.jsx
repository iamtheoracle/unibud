import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useVoice } from "@/lib/voice/VoiceProvider";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";
import LiveWaveform from "@/components/bud/LiveWaveform";

const QUICK_COMMANDS = [
  "Summarize today's classes",
  "Open my timetable",
  "What's due tomorrow?",
  "Find scholarships",
  "Start a study session",
  "Open Discover",
];

const STATE_LABELS = {
  idle: "Tap to speak",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

/**
 * VoiceOverlay — full-screen voice conversation mode.
 * Shows a large animated orb, live transcript, waveform, and controls.
 * Opens when the user taps the mic or says "Hey Bud".
 */
export default function VoiceOverlay() {
  const {
    overlayOpen,
    state,
    interim,
    transcript,
    audioLevel,
    settings,
    startConversation,
    stopConversation,
    stopSpeaking,
    speak,
    mute,
    unmute,
    setOverlayOpen,
    setSettingsOpen,
    sendPrompt,
    isSupported,
  } = useVoice();

  const handleClose = () => stopConversation();

  const handleMicTap = () => {
    if (state === "listening") {
      stopConversation();
    } else if (state === "speaking") {
      stopSpeaking();
      startConversation();
    } else {
      startConversation();
    }
  };

  return (
    <AnimatePresence>
      {overlayOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-between bg-background/95 backdrop-blur-xl safe-area-pt safe-area-pb"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top bar */}
          <div className="w-full max-w-[420px] flex items-center justify-between px-5 pt-4">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap"
            >
              <Settings className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  state === "listening"
                    ? "bg-red-500 live-pulse"
                    : state === "speaking"
                    ? "bg-primary live-pulse"
                    : "bg-muted-foreground/40"
                }`}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {STATE_LABELS[state] || "Idle"}
              </span>
              {settings.wakeWordEnabled && (
                <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-success/10 text-success">
                  Wake
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap"
            >
              <X className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
          </div>

          {/* Orb + Transcript */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-5">
            <BudVoiceOrb size={140} state={state} />

            {/* Transcript */}
            <div className="text-center min-h-[60px] max-w-[340px]">
              {state === "speaking" ? (
                <p className="text-[16px] text-foreground font-medium leading-relaxed">
                  {transcript}
                </p>
              ) : interim ? (
                <p className="text-[16px] text-foreground/90 leading-relaxed">
                  {interim}
                </p>
              ) : state === "listening" ? (
                <p className="text-[14px] text-muted-foreground">
                  I'm listening…
                </p>
              ) : (
                <p className="text-[14px] text-muted-foreground">
                  {isSupported
                    ? 'Say "Hey Bud" or tap the mic'
                    : "Voice not supported on this browser"}
                </p>
              )}
            </div>

            {/* Waveform */}
            {(state === "listening" || state === "speaking") && (
              <LiveWaveform level={audioLevel} active={state} />
            )}
          </div>

          {/* Quick commands */}
          {state === "idle" && (
            <div className="w-full max-w-[420px] px-5 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 text-center">
                Try saying
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_COMMANDS.map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => sendPrompt(cmd)}
                    className="px-3 py-2 rounded-full glass text-[12px] text-foreground/80 spring-tap"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div className="w-full max-w-[420px] flex items-center justify-center gap-4 px-5 pb-8">
            <button
              onClick={() => (settings.muted ? unmute() : mute())}
              className="w-12 h-12 rounded-full glass flex items-center justify-center spring-tap"
            >
              {settings.muted ? (
                <VolumeX className="w-5 h-5 text-destructive" />
              ) : (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <button
              onClick={handleMicTap}
              disabled={!isSupported}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center spring-tap relative disabled:opacity-40"
              style={{
                boxShadow:
                  state === "listening"
                    ? "0 0 40px hsl(var(--primary) / 0.4)"
                    : "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              {state === "listening" ? (
                <Mic className="w-7 h-7 text-primary-foreground" />
              ) : (
                <MicOff className="w-7 h-7 text-primary-foreground/70" />
              )}
              {state === "listening" && (
                <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
              )}
            </button>

            <div className="w-12 h-12" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}