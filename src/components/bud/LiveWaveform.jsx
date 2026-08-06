import React from "react";

const BAR_COUNT = 28;

/**
 * LiveWaveform — audio-reactive bar visualization.
 * Uses the `voice-wave-bar` CSS animation (defined in index.css) for the
 * pulsing effect, and scales each bar's height based on the real-time
 * audio level from the VoiceEngine's AnalyserNode.
 */
export default function LiveWaveform({ level = 0, active = "listening" }) {
  const intensity = Math.max(0.15, Math.min(1, level * 2.5 + 0.15));
  return (
    <div className="flex items-center justify-center gap-[2px] h-12">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const baseHeight = 6 + Math.abs(Math.sin(i * 0.5)) * 22;
        const dynamicHeight = baseHeight * (0.4 + intensity * 0.6);
        return (
          <span
            key={i}
            className="voice-wave-bar"
            style={{
              height: `${dynamicHeight}px`,
              animationDelay: `${i * 0.035}s`,
              animationDuration: `${0.5 + (i % 4) * 0.12}s`,
              background:
                active === "speaking"
                  ? "hsl(var(--primary) / 0.7)"
                  : "hsl(var(--foreground) / 0.6)",
            }}
          />
        );
      })}
    </div>
  );
}