import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const BudPresenceContext = createContext(null);

const DEFAULT_POSITION = { x: 0, y: 0 };

/**
 * BudPresenceProvider — manages Bud's living presence across the OS.
 *
 * Responsibilities:
 *  1. Mood management — track current mood and provide `react()` for
 *     temporary context reactions (thinking, happy, concerned, etc.)
 *     that auto-revert to idle after a duration.
 *  2. Floating Bud visibility — persisted on the user entity so it
 *     syncs across all devices. Hidden stays hidden until re-enabled.
 *  3. Floating Bud position — drag offset persisted per-user.
 */
export function BudPresenceProvider({ children }) {
  const queryClient = useQueryClient();
  const [mood, setMood] = useState("idle");
  const [hidden, setHidden] = useState(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [loaded, setLoaded] = useState(false);
  const revertTimer = useRef(null);

  // Load preferences from user data (syncs across devices via auth.me)
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (user && !loaded) {
      setHidden(user.floating_bud_hidden === true);
      if (user.floating_bud_position && typeof user.floating_bud_position === "object") {
        setPosition(user.floating_bud_position);
      }
      setLoaded(true);
    }
  }, [user, loaded]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (revertTimer.current) clearTimeout(revertTimer.current);
    };
  }, []);

  /**
   * react(mood, durationMs) — trigger a temporary mood reaction.
   * Bud shows the mood, then gracefully returns to idle.
   */
  const react = useCallback((newMood, durationMs = 2500) => {
    setMood(newMood);
    if (revertTimer.current) clearTimeout(revertTimer.current);
    revertTimer.current = setTimeout(() => setMood("idle"), durationMs);
  }, []);

  /** Set a persistent mood (no auto-revert). */
  const setMoodPersistent = useCallback((newMood) => {
    if (revertTimer.current) clearTimeout(revertTimer.current);
    setMood(newMood);
  }, []);

  /** Toggle floating Bud visibility — persisted across devices. */
  const toggleHidden = useCallback(async () => {
    const newHidden = !hidden;
    setHidden(newHidden);
    try {
      await base44.auth.updateMe({ floating_bud_hidden: newHidden });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch {
      // fail silently — local state is already updated
    }
  }, [hidden, queryClient]);

  /** Save drag position — persisted across devices. */
  const savePosition = useCallback(async (pos) => {
    setPosition(pos);
    try {
      await base44.auth.updateMe({ floating_bud_position: pos });
    } catch {
      // fail silently
    }
  }, []);

  /** Reset position to default (bottom-right). */
  const resetPosition = useCallback(async () => {
    setPosition(DEFAULT_POSITION);
    try {
      await base44.auth.updateMe({ floating_bud_position: DEFAULT_POSITION });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch {
      // fail silently
    }
  }, [queryClient]);

  return (
    <BudPresenceContext.Provider
      value={{
        mood,
        react,
        setMood: setMoodPersistent,
        hidden,
        toggleHidden,
        position,
        savePosition,
        resetPosition,
        loaded,
      }}
    >
      {children}
    </BudPresenceContext.Provider>
  );
}

export function useBudPresence() {
  const ctx = useContext(BudPresenceContext);
  if (!ctx) {
    return {
      mood: "idle",
      react: () => {},
      setMood: () => {},
      hidden: false,
      toggleHidden: () => {},
      position: DEFAULT_POSITION,
      savePosition: () => {},
      resetPosition: () => {},
      loaded: false,
    };
  }
  return ctx;
}