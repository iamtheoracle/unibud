import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { getScreenContext, UNIVERSAL_QUICK_ACTIONS } from "@/lib/budScreenContext";
import { useVoice } from "@/lib/voice/VoiceProvider";
import { hapticImpact, hapticSelect, hapticTap } from "@/lib/haptics";
import BudQuickActions from "@/components/bud/BudQuickActions";

const EASE = [0.16, 1, 0.3, 1];
const LONG_PRESS_MS = 400;

/**
 * FloatingBudButton — the premium floating AI companion on every authenticated screen.
 * - Tap: opens Bud panel
 * - Long-press: expands radial quick actions based on current screen context
 * - Mic button: opens Bud in voice mode
 */
export default function FloatingBudButton() {
  const location = useLocation();
  const isHome = location.pathname === "/home";
  const { open, setOpen, openWithPrompt, openVoice } = useBudLauncher();
  const { state: voiceState, isSupported, startConversation } = useVoice();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const buttonRef = useRef(null);

  const screenContext = getScreenContext(location.pathname);
  const actions = screenContext.actions || UNIVERSAL_QUICK_ACTIONS;

  // Close quick actions on route change
  useEffect(() => {
    setShowQuickActions(false);
  }, [location.pathname]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // Hide on BudHome — Bud is already the hero there, not a floating button
  if (isHome) return null;

  const handleTap = useCallback(() => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    hapticTap(10);
    setOpen(true);
  }, [setOpen]);

  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      hapticImpact(25);
      setShowQuickActions(true);
    }, LONG_PRESS_MS);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleQuickAction = useCallback((action) => {
    hapticSelect();
    setShowQuickActions(false);
    if (action.type === "voice") {
      openVoice();
    } else if (action.prompt) {
      openWithPrompt(action.prompt);
    } else if (action.type === "summarize") {
      openWithPrompt(`Summarize what I'm looking at on the ${screenContext.name} page. What should I focus on?`);
    }
  }, [openWithPrompt, openVoice, screenContext.name]);

  const handleVoice = useCallback(() => {
    if (!isSupported) {
      hapticTap();
      openVoice();
      return;
    }
    hapticSelect();
    startConversation();
  }, [isSupported, startConversation, openVoice]);

  return (
    <>
      {/* ═══ Floating Bud Orb ═══ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
        className="fixed z-40 pointer-events-auto"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 96px)", right: "max(1rem, env(safe-area-inset-right))" }}
      >
        <div className="flex items-center gap-2.5">
          {/* Voice button */}
          <AnimatePresence>
            {(voiceState === "listening" || voiceState === "speaking") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: 10 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="glass-strong rounded-full px-4 h-11 flex items-center gap-2 max-w-[200px]"
              >
                <div className="flex items-center gap-1">
                  <span className="voice-wave-bar h-3" />
                  <span className="voice-wave-bar h-4" />
                  <span className="voice-wave-bar h-3" />
                  <span className="voice-wave-bar h-5" />
                  <span className="voice-wave-bar h-3" />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {voiceState === "listening" ? "Listening…" : "Speaking…"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice mic button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleVoice}
            aria-label="Voice activation"
            className="w-11 h-11 rounded-full glass-strong flex items-center justify-center spring-tap shrink-0"
          >
            <Mic
              className={`w-[18px] h-[18px] ${(voiceState === "listening" || voiceState === "speaking") ? "text-primary" : "text-muted-foreground"}`}
              strokeWidth={2}
            />
            {(voiceState === "listening" || voiceState === "speaking") && (
              <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
            )}
          </motion.button>

          {/* Bud orb — the main floating button */}
          <motion.button
            ref={buttonRef}
            whileTap={{ scale: 0.92 }}
            onClick={handleTap}
            onPointerDown={handleLongPressStart}
            onPointerUp={handleLongPressEnd}
            onPointerLeave={handleLongPressEnd}
            aria-label={`Open Bud — ${screenContext.name}`}
            className="relative w-14 h-14 rounded-full glass-strong flex items-center justify-center spring-tap shrink-0 bud-breathe"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 40px hsl(var(--primary) / 0.12), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            {/* Ambient glow ring */}
            <span className="absolute inset-0 rounded-full opacity-60" style={{
              background: "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.15), transparent 70%)",
            }} />

            {/* Bud visual — minimalist companion mark */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <div className="w-2.5 h-1 rounded-full bg-primary-foreground/90" />
              </div>
              <span className="absolute -bottom-0.5 text-[8px] font-bold tracking-wide text-primary">Bud</span>
            </div>

            {/* Screen context indicator — tiny dot showing context awareness */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-success" style={{ boxShadow: "0 0 6px hsl(var(--success) / 0.6)" }} />
          </motion.button>
        </div>
      </motion.div>

      {/* ═══ Quick Actions Radial Menu ═══ */}
      <BudQuickActions
        visible={showQuickActions}
        actions={actions}
        screenName={screenContext.name}
        onSelect={handleQuickAction}
        onClose={() => setShowQuickActions(false)}
        anchorRef={buttonRef}
      />
    </>
  );
}