import { useEffect } from "react";
import { useBudPresence } from "@/lib/bud/BudPresenceContext";

/**
 * BudPresenceReactor — invisible bridge that connects app events to Bud's mood.
 *
 * Listens for `bud-react` custom events dispatched from anywhere in the app:
 *   window.dispatchEvent(new CustomEvent("bud-react", {
 *     detail: { mood: "celebrating", duration: 3000 }
 *   }));
 *
 * Supported moods: idle | thinking | happy | concerned | celebrating |
 *                  listening | lookingRight | lookingLeft
 *
 * This keeps context reactions decoupled — any component can trigger a
 * subtle Bud reaction without importing the presence context directly.
 */
export default function BudPresenceReactor() {
  const { react } = useBudPresence();

  useEffect(() => {
    const handleReaction = (e) => {
      const { mood, duration } = e.detail || {};
      if (mood) {
        react(mood, duration || 2500);
      }
    };
    window.addEventListener("bud-react", handleReaction);
    return () => window.removeEventListener("bud-react", handleReaction);
  }, [react]);

  return null;
}