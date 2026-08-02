import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useMotionValue } from "framer-motion";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { useBudPresence } from "@/lib/bud/BudPresenceContext";
import { useVoice } from "@/lib/voice/VoiceProvider";
import { hapticImpact, hapticTap } from "@/lib/haptics";
import BudHead from "@/components/bud/BudHead";
import BudFloatingActions from "@/components/bud/BudFloatingActions";

const EASE = [0.16, 1, 0.3, 1];
const LONG_PRESS_MS = 450;

/**
 * FloatingBudButton — Bud's living head floating on every authenticated screen.
 *
 * Interactions:
 *   • Tap          → opens Bud workspace instantly
 *   • Hold (450ms) → reveals quick actions bottom sheet
 *   • Drag         → repositions Bud anywhere on screen (persisted)
 *
 * Bud's mood is driven by the BudPresenceContext — it reacts to context
 * events (notifications, processing, success, achievements, errors).
 *
 * Students who hide floating Bud (Settings → Bud Experience) won't see
 * this component at all. Bud remains accessible via the nav tab and voice.
 */
export default function FloatingBudButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/home";
  const { setOpen, openVoice } = useBudLauncher();
  const { mood, hidden, position, savePosition } = useBudPresence();
  const { state: voiceState } = useVoice();
  const [showActions, setShowActions] = useState(false);

  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const isDragging = useRef(false);
  const syncedFromServer = useRef(false);

  // Drag offset motion values — initialized from saved position
  const x = useMotionValue(position?.x || 0);
  const y = useMotionValue(position?.y || 0);

  // Sync position once when loaded from server
  useEffect(() => {
    if (position && !syncedFromServer.current) {
      x.set(position.x || 0);
      y.set(position.y || 0);
      syncedFromServer.current = true;
    }
  }, [position, x, y]);

  // Close actions on route change
  useEffect(() => {
    setShowActions(false);
  }, [location.pathname]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // ── Quick action handler ──────────────────────────────────
  const handleAction = useCallback(
    (action) => {
      setShowActions(false);
      switch (action.key) {
        case "ask":
          setOpen(true);
          break;
        case "voice":
          openVoice();
          break;
        case "upload":
          setOpen(true);
          break;
        case "study":
          navigate("/study-sessions");
          break;
        case "scan":
          navigate("/knowledge");
          break;
        case "recent":
          setOpen(true);
          break;
      }
    },
    [setOpen, openVoice, navigate]
  );

  // ── Pointer handlers: tap / hold / drag ──────────────────
  const handlePointerDown = useCallback(() => {
    longPressTriggered.current = false;
    isDragging.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        hapticImpact(25);
        longPressTriggered.current = true;
        setShowActions(true);
      }
    }, LONG_PRESS_MS);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    savePosition({ x: x.get(), y: y.get() });
    setTimeout(() => {
      isDragging.current = false;
    }, 150);
  }, [x, y, savePosition]);

  const handleClick = useCallback(() => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    if (isDragging.current) return;
    hapticTap(10);
    setOpen(true);
  }, [setOpen]);

  // Hide on BudHome (Bud is the hero there) or when student has hidden floating Bud
  if (isHome || hidden) return null;

  const isVoiceActive = voiceState === "listening" || voiceState === "speaking";

  return (
    <>
      {/* ═══ Floating Bud Head ═══ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
        className="fixed z-40 pointer-events-auto"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 96px)",
          right: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <motion.div
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.12 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ x, y, touchAction: "none" }}
          role="button"
          tabIndex={0}
          aria-label="Open Bud"
          className="relative w-14 h-14 rounded-full glass-strong flex items-center justify-center spring-tap shrink-0 cursor-grab active:cursor-grabbing bud-breathe"
        >
          {/* Ambient glow */}
          <span
            className="absolute inset-0 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.15), transparent 70%)",
            }}
          />

          {/* Bud's living head — mood driven by presence context */}
          <BudHead
            size={40}
            mood={isVoiceActive ? "listening" : mood}
            glow
            active={isVoiceActive}
          />

          {/* Voice active badge */}
          {isVoiceActive && (
            <span
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-success"
              style={{ boxShadow: "0 0 8px hsl(var(--success) / 0.6)" }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* ═══ Quick Actions Sheet ═══ */}
      <BudFloatingActions
        visible={showActions}
        onSelect={handleAction}
        onClose={() => setShowActions(false)}
      />
    </>
  );
}