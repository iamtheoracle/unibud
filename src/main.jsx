import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { base44 } from '@/api/base44Client'
import { initNotificationEngine } from '@/lib/spark/notifications/bootstrap'
import ErrorBoundary from '@/components/ErrorBoundary'
import { initProductionLogging } from '@/lib/production/logger'
import { runtime } from '@/lib/runtime'

// ─── Normalize unhandled rejections ──────────────────────────────────
// The Base44 vite plugin's unhandled-rejection handler reads event.reason.stack,
// which crashes when a promise rejects with undefined or a non-Error value.
// This capture-phase listener normalizes the reason to a proper Error before
// the platform handler runs.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    if (!reason || typeof reason.stack !== 'string') {
      const normalized = reason instanceof Error
        ? reason
        : reason != null
          ? new Error(String(reason))
          : new Error('Unhandled rejection (undefined reason)');
      if (!normalized.stack) normalized.stack = new Error().stack || '';
      try {
        Object.defineProperty(e, 'reason', { value: normalized, writable: true, configurable: true });
      } catch {
        e.preventDefault();
      }
    }
  }, { capture: true });
}

// Boot the Spark Notification Engine (Tier 1 Core) before the UI mounts.
initNotificationEngine(base44)
// Production logging: capture uncaught errors & unhandled rejections.
initProductionLogging()

// ─── Staged Runtime Boot ──────────────────────────────────────────────
// BootLoader → Kernel → Registries → Services → AI Runtime → App → Health
// Non-blocking: the runtime becomes ready in the background. Components
// that depend on it check runtime.ready before use.
runtime.boot().then((result) => {
  if (result.ready) {
    // console.info already handled by logger
  } else {
    console.error('[UNIBUD Runtime] Boot failed:', result.stage, result.error)
  }
}).catch((e) => {
  console.error('[UNIBUD Runtime] Boot error:', e)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)