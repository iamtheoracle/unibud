import React, { useState, useRef, useCallback } from "react";
import { Mic } from "lucide-react";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";
import { useVoiceInput } from "@/hooks/useVoiceInput";

/**
 * BudVoiceMode — premium voice surface. Floating living orb + waveform.
 * Speech-to-text via useVoiceInput; Bud's reply is spoken via SpeechSynthesis.
 */
function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98; u.pitch = 1.02;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}
function stopSpeak() { try { window.speechSynthesis.cancel(); } catch {} }

export default function BudVoiceMode({ onTranscript, budState = "idle", reply = "" }) {
  const [live, setLive] = useState("");
  const { isListening, isSupported, toggleListening } = useVoiceInput();
  const stoppedRef = useRef(false);

  const handleMic = useCallback(() => {
    if (!isSupported) return;
    toggleListening((t) => {
      setLive(t);
      if (t.trim().length > 3 && !stoppedRef.current) onTranscript?.(t.trim());
    });
  }, [toggleListening, onTranscript]);

  const state = isListening ? "listening" : budState;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-5 text-center">
      <BudVoiceOrb size={150} state={state} className="mb-6" />
      <p className="font-heading font-semibold text-[15px] text-foreground mb-1">
        {isListening ? "I'm listening…" : reply ? "Bud" : "Tap to speak with Bud"}
      </p>
      <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[280px] min-h-[34px]">
        {isListening ? (live || "Listening…") : reply || "Voice mode is a calm, hands-free way to talk with me."}
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleMic}
          disabled={!isSupported}
          className={`w-16 h-16 rounded-full flex items-center justify-center spring-tap disabled:opacity-40 ${isListening ? "bg-primary text-primary-foreground ice-glow" : "glass-strong text-primary"}`}
          aria-label={isListening ? "Stop listening" : "Start voice"}
        >
          <Mic className="w-6 h-6" strokeWidth={2} />
          {isListening && <span className="absolute w-16 h-16 rounded-full border-2 border-primary/60 live-pulse" />}
        </button>
      </div>
      {!isSupported && <p className="text-[10px] text-muted-foreground mt-3">Voice input isn't supported on this device.</p>}
    </div>
  );
}

export { speak, stopSpeak };