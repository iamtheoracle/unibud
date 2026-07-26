import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { base44 } from '@/api/base44Client'
import { initNotificationEngine } from '@/lib/spark/notifications/bootstrap'
import ErrorBoundary from '@/components/ErrorBoundary'
import { initProductionLogging } from '@/lib/production/logger'

// Boot the Spark Notification Engine (Tier 1 Core) before the UI mounts.
initNotificationEngine(base44)
// Production logging: capture uncaught errors & unhandled rejections.
initProductionLogging()

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)