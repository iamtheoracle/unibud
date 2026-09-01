/**
 * Lightweight haptic feedback utility for touch devices.
 * Uses the Vibration API where available; silently no-ops otherwise.
 */

export function hapticTap(duration = 8) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

export function hapticSelect(duration = 12) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

export function hapticImpact(duration = 20) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(duration);
  }
}