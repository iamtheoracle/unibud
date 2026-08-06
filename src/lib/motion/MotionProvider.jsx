/**
 * MotionProvider — Dependency Injection for the Motion Engine
 *
 * Creates a MotionEngine instance and injects it via React Context.
 * Every subsystem consumes it through useMotion(), enabling:
 *   • Dependency injection (swap implementations for testing)
 *   • Mocking (inject a no-op engine in test environments)
 *   • Future engine replacement (swap MotionEngine for a different impl)
 *
 * Also detects reduced-motion and battery-saver preferences and
 * configures the engine accordingly.
 */

import React, { createContext, useEffect, useMemo } from 'react';
import { createMotionEngine } from './motionEngine';

const MotionContext = createContext(null);

export function MotionProvider({ children, engine: engineOverride }) {
  // Create a single engine instance for this provider tree.
  // If an override is passed (testing/mocking), use that instead.
  const engine = useMemo(() => engineOverride || createMotionEngine(), [engineOverride]);

  // Sync accessibility preferences into the engine.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    engine.setReducedMotion(mq.matches);

    const handler = (e) => engine.setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [engine]);

  return (
    <MotionContext.Provider value={engine}>
      {children}
    </MotionContext.Provider>
  );
}

export default MotionProvider;
export { MotionContext };