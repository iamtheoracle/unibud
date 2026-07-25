import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { base44 } from '@/api/base44Client'
import { initNotificationEngine } from '@/lib/spark/notifications/bootstrap'

// Boot the Spark Notification Engine (Tier 1 Core) before the UI mounts.
initNotificationEngine(base44)

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)