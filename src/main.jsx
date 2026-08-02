import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { base44 } from '@/api/base44Client'
import { initNotificationEngine } from '@/lib/spark/notifications/bootstrap'
import ErrorBoundary from '@/components/ErrorBoundary'
import { initProductionLogging } from '@/lib/production/logger'
import { runtime } from '@/lib/runtime'

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