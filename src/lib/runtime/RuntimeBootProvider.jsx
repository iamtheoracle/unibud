import React, { useEffect, useRef } from 'react';
import { runtimeBoot } from './boot';
import { logger } from './logger';

/**
 * RuntimeBootProvider — boots the Platform Core runtime on app startup.
 *
 * Runs the 7-stage boot sequence (BootLoader → Kernel → Registries → Services
 * → AI Runtime → Application → Health Checks) in the background. Services
 * work individually before boot completes — this just wires health checks,
 * metrics flushing, kernel dependencies, and Orbit recovery.
 *
 * Does NOT block rendering. Children render immediately; boot runs async.
 */
export function RuntimeBootProvider({ children }) {
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    if (runtimeBoot.stage === 'idle') {
      runtimeBoot.boot().catch((e) => {
        logger.error('Runtime boot failed in provider', { error: e.message });
      });
    }
  }, []);

  return children;
}

export default RuntimeBootProvider;