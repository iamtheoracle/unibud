import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Volume2 } from "lucide-react";
import { useVoice } from "@/lib/voice/VoiceProvider";
import {
  VOICE_PERSONALITIES,
  VOICE_MODES,
  VOICE_MODE_LABELS,
} from "@/lib/voice/voiceSettings";

const MODE_OPTIONS = [
  { id: VOICE_MODES.PUSH_TO_TALK, label: "Push to Talk", desc: "Tap mic to speak" },
  { id: VOICE_MODES.HANDS_FREE, label: "Hands Free", desc: "Wake word activated" },
  { id: VOICE_MODES.CONTINUOUS, label: "Continuous", desc: "Back-to-back chat" },
];

/**
 * VoiceSettingsPanel — bottom sheet for configuring Bud's voice.
 * Personality picker, rate/pitch/volume sliders, mode selector, toggles.
 */
export default function VoiceSettingsPanel() {
  const {
    settingsOpen,
    settings,
    updateSettings,
    setSettingsOpen,
    speak,
    mute,
    unmute,
    isSupported,
  } = useVoice();

  const testVoice = () => {
    speak(
      "Hi! I'm Bud, your academic companion. I'm here to help you succeed."
    );
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-bold text-foreground">
                  Voice Settings
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  Customize Bud's voice
                </p>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Personality Picker */}
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Voice Personality
              </p>
              <div className="grid grid-cols-1 gap-2">
                {VOICE_PERSONALITIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => updateSettings({ personality: p.id })}
                    className={`flex items-center gap-3 p-3 rounded-2xl border spring-tap text-left ${
                      settings.personality === p.id
                        ? "border-primary bg-primary/10"
                        : "border-border glass"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground">
                        {p.name}
                      </p>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {p.desc}
                      </p>
                    </div>
                    {settings.personality === p.id && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 mb-6">
              <SliderRow
                label="Speaking Speed"
                value={settings.rate}
                min={0.5}
                max={2.0}
                step={0.05}
                onChange={(v) => updateSettings({ rate: v })}
                format={(v) => `${v.toFixed(2)}x`}
              />
              <SliderRow
                label="Pitch"
                value={settings.pitch}
                min={0}
                max={2.0}
                step={0.05}
                onChange={(v) => updateSettings({ pitch: v })}
                format={(v) => v.toFixed(2)}
              />
              <SliderRow
                label="Volume"
                value={settings.volume}
                min={0}
                max={1.0}
                step={0.05}
                onChange={(v) => updateSettings({ volume: v })}
                format={(v) => `${Math.round(v * 100)}%`}
              />
            </div>

            {/* Mode Selector */}
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Interaction Mode
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MODE_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateSettings({ mode: m.id })}
                    className={`py-3 px-2 rounded-xl text-center spring-tap ${
                      settings.mode === m.id
                        ? "bg-primary text-primary-foreground"
                        : "glass text-muted-foreground"
                    }`}
                  >
                    <p className="text-[12px] font-semibold">{m.label}</p>
                    <p
                      className={`text-[9px] mt-0.5 ${
                        settings.mode === m.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {m.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 mb-6">
              <ToggleRow
                label="Wake Word"
                desc='Say "Hey Bud" to activate'
                enabled={settings.wakeWordEnabled}
                onToggle={() =>
                  updateSettings({ wakeWordEnabled: !settings.wakeWordEnabled })
                }
              />
              <ToggleRow
                label="Whisper Mode"
                desc="Quieter, slower speech"
                enabled={settings.whisperMode}
                onToggle={() =>
                  updateSettings({ whisperMode: !settings.whisperMode })
                }
              />
              <ToggleRow
                label="Auto-Speak Replies"
                desc="Bud speaks responses aloud"
                enabled={settings.autoSpeak}
                onToggle={() =>
                  updateSettings({ autoSpeak: !settings.autoSpeak })
                }
              />
              <ToggleRow
                label="Mute Bud"
                desc="Silence all voice"
                enabled={settings.muted}
                onToggle={() => (settings.muted ? unmute() : mute())}
              />
            </div>

            {/* Test Voice */}
            <button
              onClick={testVoice}
              disabled={!isSupported || settings.muted}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50"
            >
              <Volume2 className="w-4 h-4" />
              Test Voice
            </button>

            {!isSupported && (
              <p className="text-[11px] text-muted-foreground text-center mt-3">
                Voice features require a supported browser (Chrome, Safari, Edge).
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SliderRow({ label, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-foreground font-medium">{label}</span>
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function ToggleRow({ label, desc, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl glass">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-foreground">{label}</p>
        {desc && (
          <p className="text-[12px] text-muted-foreground">{desc}</p>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
          enabled ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}